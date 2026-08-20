import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from import_data import ENV_PATH, load_env  # noqa: E402
from bson import ObjectId  # noqa: E402
from pymongo import MongoClient  # noqa: E402

env = load_env(ENV_PATH)
c = MongoClient(env["MONGODB_URL"], serverSelectionTimeoutMS=15000)
db = c[env["DATABASE_NAME"]]

apt = db["appointments"].find_one()
pred = db["predictions"].find_one({"appointment_id": str(apt["_id"])})
pat = db["patients"].find_one({"_id": ObjectId(apt["patient_id"])})
doc = db["doctors"].find_one({"doctor_id": apt["doctor_id"]})
print("appointment:", apt["appointment_id"], "| status:", apt["status"], "| day:", apt["appointment_day"])
print("prediction linked:", pred is not None, "| risk:", pred["scheduling_risk"], "| prob:", pred["no_show_probability"])
print("patient linked:", pat is not None, "| name:", pat["name"] if pat else None)
print("doctor linked:", doc is not None, "| name:", doc["name"] if doc else None)

# Integrity via a single aggregation: how many appointments lack a prediction?
linked = list(
    db["appointments"].aggregate(
        [
            {
                "$lookup": {
                    "from": "predictions",
                    "localField": "_id",
                    "foreignField": "appointment_id",
                    "as": "pred",
                }
            },
            {"$project": {"has_pred": {"$gt": [{"$size": "$pred"}, 0]}}},
            {"$group": {"_id": "$has_pred", "n": {"$sum": 1}}},
        ]
    )
)
print("linkage (has_prediction -> count):", {str(r["_id"]): r["n"] for r in linked})

for r in db["predictions"].aggregate([{"$group": {"_id": "$scheduling_risk", "n": {"$sum": 1}}}]):
    print("risk", r["_id"], r["n"])

for r in db["appointments"].aggregate([{"$group": {"_id": "$status", "n": {"$sum": 1}}}]):
    print("status", r["_id"], r["n"])

for u in db["users"].find({}, {"email": 1, "role": 1}):
    print("user:", u.get("email"), u.get("role"))

# Test the previously-broken aggregation pipelines directly.
volume = list(
    db["appointments"].aggregate(
        [
            {"$group": {"_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$appointment_day"}}, "value": {"$sum": 1}}},
            {"$sort": {"_id": 1}},
        ]
    )
)
print("time-series days:", len(volume))

by_clinic = list(
    db["appointments"].aggregate(
        [{"$group": {"_id": "$clinic_id", "average": {"$avg": "$waiting_time"}}}, {"$sort": {"_id": 1}}]
    )
)
print("waiting by clinic:", [(r["_id"], round(r["average"], 1)) for r in by_clinic])

dist = list(
    db["appointments"].aggregate(
        [
            {"$match": {"waiting_time": {"$type": "number"}}},
            {"$bucket": {"groupBy": "$waiting_time", "boundaries": [0, 10, 20, 30, 45, 60, 90, 120, 180], "default": "Other"}},
        ]
    )
)
print("waiting distribution buckets:", len(dist))

c.close()
