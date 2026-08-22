"""Seed / import script for the Healthcare Appointment Intelligence System.

Reads data/clinic_operations.csv and populates MongoDB:
    clinics, doctors, patients, appointments
then generates a prediction document per appointment using the existing
trained models (no_show_model.pkl / waiting_time_model.pkl).

Also seeds three demo users (admin / doctor / staff) when the users
collection is empty.

Usage (from the project root):
    python scripts/import_data.py                 # full import
    python scripts/import_data.py --limit 20000   # only first N CSV rows
    python scripts/import_data.py --drop          # drop collections first
    python scripts/import_data.py --skip-predictions

The script is idempotent: unique indexes are created on every id field and
records are upserted, so it can be run repeatedly without duplicates.
"""

import argparse
import hashlib
import sys
from datetime import datetime, timezone
from pathlib import Path

import bcrypt
import joblib
import numpy as np
import pandas as pd
from bson import ObjectId
from pymongo import ASCENDING, MongoClient, ReplaceOne

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

# Reuse the existing backend business logic (no duplication).
from app.services.no_show_service import FEATURE_ORDER as NO_SHOW_FEATURES  # noqa: E402
from app.services.no_show_service import risk_level_for_probability  # noqa: E402
from app.services.scheduling_risk_service import calculate_scheduling_risk  # noqa: E402
from app.services.waiting_time_service import FEATURE_ORDER as WAITING_FEATURES  # noqa: E402

CSV_PATH = PROJECT_ROOT / "data" / "clinic_operations.csv"
ENV_PATH = BACKEND_DIR / ".env"
NO_SHOW_MODEL_PATH = BACKEND_DIR / "app" / "ml" / "no_show_model.pkl"
WAITING_MODEL_PATH = BACKEND_DIR / "app" / "ml" / "waiting_time_model.pkl"

CHUNK_SIZE = 5000
BULK_SIZE = 1000

CLINICS = {
    "C01": {"name": "Central Health Center", "location": "City Center"},
    "C02": {"name": "Northside Medical Clinic", "location": "North District"},
    "C03": {"name": "Riverside Family Clinic", "location": "Riverside"},
    "C04": {"name": "Eastgate Community Clinic", "location": "East District"},
    "C05": {"name": "Westfield Health Hub", "location": "West District"},
}

FIRST_NAMES = [
    "Ana", "Bruno", "Carla", "Diego", "Elena", "Felipe", "Gina", "Hugo",
    "Ivana", "Joao", "Karla", "Lucas", "Marta", "Nuno", "Olivia", "Paulo",
    "Rita", "Sofia", "Tiago", "Vera",
]
LAST_NAMES = [
    "Almeida", "Barros", "Cardoso", "Dias", "Esteves", "Fonseca", "Gomes",
    "Henriques", "Jesus", "Lopes", "Marques", "Neves", "Oliveira", "Pereira",
    "Ramos", "Silva", "Teixeira", "Valente",
]

DEMO_USERS = [
    {"name": "System Administrator", "email": "admin@clinic.com", "password": "Admin@12345", "role": "admin"},
    {"name": "Dr. Sarah Mendes", "email": "doctor@clinic.com", "password": "Doctor@12345", "role": "doctor"},
    {"name": "Front Desk Staff", "email": "staff@clinic.com", "password": "Staff@12345", "role": "staff"},
]


def load_env(path: Path) -> dict:
    values = {}
    if not path.exists():
        return values
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        values[key.strip()] = value.strip()
    return values


def deterministic_name(seed: int, prefix: str = "") -> str:
    first = FIRST_NAMES[seed % len(FIRST_NAMES)]
    last = LAST_NAMES[(seed // len(FIRST_NAMES)) % len(LAST_NAMES)]
    return f"{prefix}{first} {last}"


def stable_object_id(key: str) -> ObjectId:
    """Deterministic ObjectId derived from a business key (idempotent re-runs)."""
    return ObjectId(hashlib.md5(key.encode("utf-8")).hexdigest()[:24])


def parse_datetime(value: str) -> datetime:
    ts = pd.to_datetime(value, utc=True)
    return ts.tz_localize(None).to_pydatetime()


def ensure_indexes(db) -> None:
    db["users"].create_index([("email", ASCENDING)], unique=True)
    db["clinics"].create_index([("clinic_id", ASCENDING)], unique=True)
    db["doctors"].create_index([("doctor_id", ASCENDING)], unique=True)
    db["patients"].create_index([("patient_id", ASCENDING)], unique=True)
    db["appointments"].create_index([("appointment_id", ASCENDING)], unique=True)
    db["appointments"].create_index([("patient_id", ASCENDING)])
    db["appointments"].create_index([("clinic_id", ASCENDING)])
    db["appointments"].create_index([("doctor_id", ASCENDING)])
    db["appointments"].create_index([("appointment_day", ASCENDING)])
    db["predictions"].create_index([("appointment_id", ASCENDING)], unique=True)


def seed_users(db) -> None:
    if db["users"].count_documents({}) > 0:
        print("[users] Collection already has users - skipping seed.")
        return
    docs = []
    for user in DEMO_USERS:
        docs.append(
            {
                "name": user["name"],
                "email": user["email"],
                "password_hash": bcrypt.hashpw(user["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
                "role": user["role"],
                "created_at": datetime.now(timezone.utc),
            }
        )
    db["users"].insert_many(docs)
    print(f"[users] Seeded {len(docs)} demo accounts:")
    for user in DEMO_USERS:
        print(f"        {user['role']:<6} {user['email']}  ({user['password']})")


def seed_clinics(db) -> None:
    ops = []
    for clinic_id, info in CLINICS.items():
        doc = {
            "clinic_id": clinic_id,
            "name": info["name"],
            "location": info["location"],
            "doctor_ids": [],
        }
        ops.append(ReplaceOne({"clinic_id": clinic_id}, doc, upsert=True))
    db["clinics"].bulk_write(ops, ordered=False)
    print(f"[clinics] Upserted {len(ops)} clinics.")


def bulk_upsert(collection, key_field: str, docs: list[dict]) -> None:
    ops = [ReplaceOne({key_field: doc[key_field]}, doc, upsert=True) for doc in docs]
    for start in range(0, len(ops), BULK_SIZE):
        collection.bulk_write(ops[start : start + BULK_SIZE], ordered=False)


class DoctorRegistry:
    def __init__(self, db):
        self.db = db
        self.seen: dict[str, dict] = {}

    def register(self, doctor_id: str) -> dict | None:
        if not doctor_id or doctor_id in self.seen:
            return self.seen.get(doctor_id)
        seed = int(str(doctor_id)[1:] or 0)
        doc = {
            "doctor_id": doctor_id,
            "name": deterministic_name(seed, prefix="Dr. "),
            "clinic_id": "",
            "specialization": "General Practice",
            "active": True,
        }
        self.seen[doctor_id] = doc
        return doc

    def flush(self) -> None:
        if not self.seen:
            return
        bulk_upsert(self.db["doctors"], "doctor_id", list(self.seen.values()))
        print(f"[doctors] Upserted {len(self.seen)} doctors.")
        self._link_to_clinics()

    def _link_to_clinics(self) -> None:
        clinics = {}
        for doctor_id, doc in self.seen.items():
            if doc["clinic_id"]:
                clinics.setdefault(doc["clinic_id"], []).append(doctor_id)
        for clinic_id, doctor_ids in clinics.items():
            self.db["clinics"].update_one({"clinic_id": clinic_id}, {"$set": {"doctor_ids": doctor_ids}})


class PatientRegistry:
    """Maps dataset PatientId values to patients collection _id strings."""

    def __init__(self, db):
        self.db = db
        self.cache: dict[str, str] = {}
        self.pending: dict[str, dict] = {}

    def resolve(self, patient_id: str, age: int, gender: str, neighbourhood: str) -> str:
        cached = self.cache.get(patient_id)
        if cached:
            return cached
        pending = self.pending.get(patient_id)
        if pending is None:
            seed = int(patient_id[-9:]) if patient_id.isdigit() else abs(hash(patient_id)) % 10**9
            pending = {
                "patient_id": patient_id,
                "name": deterministic_name(seed),
                "age": age,
                "gender": gender,
                "neighbourhood": neighbourhood,
                "created_at": datetime.now(timezone.utc),
            }
            self.pending[patient_id] = pending
        elif age:
            pending["age"] = age
        return ""  # resolved after flush()

    def flush(self) -> None:
        if not self.pending:
            return
        bulk_upsert(self.db["patients"], "patient_id", list(self.pending.values()))
        print(f"[patients] Upserted {len(self.pending)} patients.")
        stored = self.db["patients"].find(
            {"patient_id": {"$in": list(self.pending.keys())}}, {"_id": 1, "patient_id": 1}
        )
        for doc in stored:
            self.cache[doc["patient_id"]] = str(doc["_id"])
        self.pending.clear()


def build_prediction_docs(chunk_docs: list[dict], ns_model, wt_model) -> list[dict]:
    """Vectorized batch inference using the existing trained models."""
    ns_frame = pd.DataFrame(
        [
            [
                float(d["age"]),
                float(d["scholarship"]),
                float(d["hypertension"]),
                float(d["diabetes"]),
                float(d["alcoholism"]),
                float(d["handicap"]),
                float(d["sms_received"]),
                float((d["appointment_day"] - d["scheduled_day"]).days),
                float(d["appointment_day"].weekday()),
                float(d["appointment_day"].month),
                float(d["appointment_day"].hour),
            ]
            for d in chunk_docs
        ],
        columns=NO_SHOW_FEATURES,
    )
    wt_frame = pd.DataFrame(
        [
            [
                float(d["queue_length"]),
                float(d["patients_ahead"]),
                float(d["consultation_duration"]),
                float(d["doctor_load"]),
                float(d["room_available"]),
            ]
            for d in chunk_docs
        ],
        columns=WAITING_FEATURES,
    )

    probabilities = np.asarray(ns_model.predict_proba(ns_frame))[:, 1]
    waiting_times = np.asarray(wt_model.predict(wt_frame), dtype=float)

    prediction_docs = []
    for doc, probability, waiting_time in zip(chunk_docs, probabilities, waiting_times):
        risk, score, factors = calculate_scheduling_risk(
            no_show_probability=float(probability),
            waiting_time=float(waiting_time),
            doctor_load=doc["doctor_load"],
            queue_length=doc["queue_length"],
            room_available=doc["room_available"],
        )
        prediction_docs.append(
            {
                "appointment_id": str(doc["_id"]),
                "no_show_probability": round(float(probability), 4),
                "no_show_risk": risk_level_for_probability(float(probability)),
                "expected_waiting_time": round(float(waiting_time), 2),
                "scheduling_risk": risk,
                "risk_score": score,
                "risk_factors": factors,
                "created_at": datetime.now(timezone.utc),
            }
        )
    return prediction_docs


def row_to_appointment_doc(row, patient_oid: str) -> dict:
    scheduled_day = parse_datetime(row["ScheduledDay"])
    appointment_day = parse_datetime(row["AppointmentDay"])
    return {
        "appointment_id": str(row["AppointmentID"]),
        "patient_id": patient_oid,
        "doctor_id": str(row["doctor_id"]),
        "clinic_id": str(row["clinic_id"]),
        "scheduled_day": scheduled_day,
        "appointment_day": appointment_day,
        "status": "No-show" if str(row.get("No-show", "")).strip().lower() == "yes" else "Completed",
        "sms_received": int(float(row["SMS_received"])),
        "queue_length": int(float(row["queue_length"])),
        "patients_ahead": int(float(row["patients_ahead"])),
        "consultation_duration": int(float(row["consultation_duration"])),
        "doctor_load": float(row["doctor_load"]),
        "room_available": int(float(row["room_available"])),
        "waiting_time": round(float(row["waiting_time"]), 1),
        # Fields used by the models but kept denormalized on the document.
        "age": max(int(float(row["Age"])), 0),
        "gender": str(row["Gender"]),
        "scholarship": int(float(row["Scholarship"])),
        "hypertension": int(float(row["Hipertension"])),
        "diabetes": int(float(row["Diabetes"])),
        "alcoholism": int(float(row["Alcoholism"])),
        "handicap": int(float(row["Handcap"])),
        "neighbourhood": str(row["Neighbourhood"]),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Import clinic operations data into MongoDB.")
    parser.add_argument("--limit", type=int, default=0, help="Only import the first N CSV rows (0 = all).")
    parser.add_argument("--drop", action="store_true", help="Drop data collections before importing.")
    parser.add_argument("--skip-predictions", action="store_true", help="Do not generate predictions.")
    args = parser.parse_args()

    env = load_env(ENV_PATH)
    mongodb_url = env.get("MONGODB_URL")
    database_name = env.get("DATABASE_NAME", "healthcare_intelligence")
    if not mongodb_url:
        print("ERROR: MONGODB_URL not found in backend/.env")
        sys.exit(1)

    print(f"Connecting to database '{database_name}' ...")
    client = MongoClient(mongodb_url, serverSelectionTimeoutMS=15000)
    client.admin.command("ping")
    db = client[database_name]

    if args.drop:
        print("Dropping existing collections ...")
        for name in ["appointments", "predictions", "patients", "doctors", "clinics"]:
            db[name].drop()

    ensure_indexes(db)
    seed_users(db)
    seed_clinics(db)

    doctors = DoctorRegistry(db)
    patients = PatientRegistry(db)

    print(f"Loading models: {NO_SHOW_MODEL_PATH.name}, {WAITING_MODEL_PATH.name}")
    ns_model = joblib.load(NO_SHOW_MODEL_PATH)
    wt_model = joblib.load(WAITING_MODEL_PATH)

    reader = pd.read_csv(CSV_PATH, chunksize=min(CHUNK_SIZE, args.limit) if args.limit else CHUNK_SIZE)
    total_rows = 0
    total_predictions = 0

    for chunk_number, chunk in enumerate(reader, start=1):
        if args.limit and total_rows >= args.limit:
            break
        if args.limit:
            remaining = args.limit - total_rows
            if len(chunk) > remaining:
                chunk = chunk.head(remaining)

        # Register doctors / patients first so appointments can reference them.
        for doctor_id, clinic_id in zip(chunk["doctor_id"], chunk["clinic_id"]):
            doctor = doctors.register(str(doctor_id))
            if doctor and not doctor["clinic_id"]:
                doctor["clinic_id"] = str(clinic_id)
        doctors.flush()

        for pid, age, gender, neighbourhood in zip(
            chunk["PatientId"], chunk["Age"], chunk["Gender"], chunk["Neighbourhood"]
        ):
            patients.resolve(str(pid), int(age), str(gender), str(neighbourhood))
        patients.flush()

        chunk_docs = []
        for _, row in chunk.iterrows():
            patient_oid = patients.cache.get(str(row["PatientId"]))
            if not patient_oid:
                continue
            doc = row_to_appointment_doc(row, patient_oid)
            doc["_id"] = stable_object_id(doc["appointment_id"])  # stable so re-runs stay consistent
            chunk_docs.append(doc)

        if chunk_docs:
            bulk_upsert(db["appointments"], "appointment_id", chunk_docs)
            total_rows += len(chunk_docs)

            if not args.skip_predictions:
                prediction_docs = build_prediction_docs(chunk_docs, ns_model, wt_model)
                bulk_upsert(db["predictions"], "appointment_id", prediction_docs)
                total_predictions += len(prediction_docs)

        print(
            f"[chunk {chunk_number}] imported={total_rows} rows, "
            f"predictions={total_predictions}",
            end="\r",
        )

    print()
    print("Import complete:")
    for name in ["clinics", "doctors", "patients", "appointments", "predictions", "users"]:
        count = db[name].count_documents({})
        print(f"  {name:<13} {count:>7} documents")

    client.close()


if __name__ == "__main__":
    main()
