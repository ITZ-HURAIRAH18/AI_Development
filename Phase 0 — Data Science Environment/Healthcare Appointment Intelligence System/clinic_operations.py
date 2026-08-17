# THis is used to create clinic operations dataset from the appointments dataset. It adds synthetic features like doctor ID, clinic ID, queue length, patients ahead, check-in time, consultation duration, doctor load, room availability, and waiting time.


# import pandas as pd
# import numpy as np

# # Load your Kaggle dataset
# df = pd.read_csv("appointments.csv")

# # Make results reproducible
# np.random.seed(42)

# # Number of appointments
# n = len(df)

# # -----------------------------
# # 1. Doctor ID
# # -----------------------------
# df["doctor_id"] = np.random.choice(
#     [f"D{i:03d}" for i in range(1, 21)],  # 20 doctors
#     size=n
# )

# # -----------------------------
# # 2. Clinic ID
# # -----------------------------
# df["clinic_id"] = np.random.choice(
#     [f"C{i:02d}" for i in range(1, 6)],   # 5 clinics
#     size=n
# )

# # -----------------------------
# # 3. Queue length
# # -----------------------------
# df["queue_length"] = np.random.poisson(
#     lam=4,
#     size=n
# )

# # -----------------------------
# # 4. Patients ahead
# # -----------------------------
# df["patients_ahead"] = np.maximum(
#     0,
#     df["queue_length"] - np.random.randint(0, 3, size=n)
# )

# # -----------------------------
# # 5. Check-in time
# # -----------------------------
# # Convert appointment date
# df["AppointmentDay"] = pd.to_datetime(df["AppointmentDay"])

# # Patient checks in 5-30 minutes before/after appointment
# check_in_offset = np.random.randint(
#     -10, 31, size=n
# )

# df["check_in_time"] = (
#     df["AppointmentDay"]
#     + pd.to_timedelta(check_in_offset, unit="m")
# )

# # -----------------------------
# # 6. Consultation duration
# # -----------------------------
# df["consultation_duration"] = np.random.normal(
#     loc=20,
#     scale=5,
#     size=n
# ).clip(5, 60).round().astype(int)

# # -----------------------------
# # 7. Doctor load
# # -----------------------------
# df["doctor_load"] = (
#     df["queue_length"] / 10
# ).clip(0, 1).round(2)

# # -----------------------------
# # 8. Room available
# # -----------------------------
# df["room_available"] = np.random.choice(
#     [0, 1],
#     size=n,
#     p=[0.15, 0.85]
# )

# # -----------------------------
# # 9. Waiting time
# # -----------------------------
# df["waiting_time"] = (
#     df["patients_ahead"] *
#     df["consultation_duration"] *
#     0.7
#     + np.random.normal(5, 3, n)
# ).clip(0, 180).round().astype(int)

# # Save synthetic operational dataset
# df.to_csv(
#     "clinic_operations.csv",
#     index=False
# )

# print(df[
#     [
#         "doctor_id",
#         "clinic_id",
#         "queue_length",
#         "patients_ahead",
#         "check_in_time",
#         "consultation_duration",
#         "doctor_load",
#         "room_available",
#         "waiting_time"
#     ]
# ].head())






# this is used to check for missing values in the datasets. It reads the appointments and clinic operations datasets, then prints the count of missing values for each column in both datasets.


# import pandas as pd

# appointments = pd.read_csv("appointments.csv")
# operations = pd.read_csv("clinic_operations.csv")

# # print("Appointments:")
# # print(appointments.shape)
# # print(appointments.columns)

# # print("\nOperations:")
# # print(operations.shape)
# # print(operations.columns)

# print(appointments.isnull().sum())
# print(operations.isnull().sum())







# this is used to perform exploratory data analysis (EDA) on the clinic operations dataset. It reads the dataset and generates a bar plot showing the distribution of appointment attendance versus no-show.


# import pandas as pd
# import matplotlib.pyplot as plt

# df = pd.read_csv("clinic_operations.csv")

# print(df["No-show"].value_counts())

# df["No-show"].value_counts().plot(
#     kind="bar",
#     title="Appointment Attendance vs No-show"
# )

# plt.xlabel("Appointment Status")
# plt.ylabel("Number of Patients")
# plt.show()






# THis is used to analyze the relationship between receiving an SMS reminder and the likelihood of a patient showing up for their appointment. It reads the clinic operations dataset and creates a cross-tabulation of SMS received versus no-show, normalizing the results to show percentages.

# import pandas as pd

# df = pd.read_csv("clinic_operations.csv")

# sms_result = pd.crosstab(
#     df["SMS_received"],
#     df["No-show"],
#     normalize="index"
# ) * 100

# print(sms_result)

# import matplotlib.pyplot as plt

# sms_result.plot(
#     kind="bar",
#     figsize=(8, 5)
# )

# plt.title("SMS Reminder vs No-show")
# plt.xlabel("SMS Received (0 = No, 1 = Yes)")
# plt.ylabel("Percentage")
# plt.xticks(rotation=0)
# plt.legend(title="No-show")

# plt.show()




# This is used to analyze the average waiting time for patients who showed up versus those who did not. It reads the clinic operations dataset, calculates the waiting days based on the scheduled and appointment dates, and then computes the average waiting days for both groups.

# import pandas as pd

# df = pd.read_csv("clinic_operations.csv")

# df["ScheduledDay"] = pd.to_datetime(df["ScheduledDay"])
# df["AppointmentDay"] = pd.to_datetime(df["AppointmentDay"])

# df["waiting_days"] = (
#     df["AppointmentDay"].dt.normalize()
#     - df["ScheduledDay"].dt.normalize()
# ).dt.days

# print(
#     df.groupby("No-show")["waiting_days"]
#     .mean()
# )






# import pandas as pd

# df = pd.read_csv("clinic_operations.csv")

# age_result = df.groupby("No-show")["Age"].agg(
#     ["mean", "median", "min", "max"]
# )

# print(age_result)



# import pandas as pd

# df = pd.read_csv("clinic_operations.csv")

# df["age_group"] = pd.cut(
#     df["Age"],
#     bins=[0, 18, 30, 45, 60, 100],
#     labels=[
#         "0-18",
#         "19-30",
#         "31-45",
#         "46-60",
#         "61+"
#     ]
# )

# result = pd.crosstab(
#     df["age_group"],
#     df["No-show"],
#     normalize="index"
# ) * 100

# print(result)






# import pandas as pd

# df = pd.read_csv("clinic_operations.csv")

# df["AppointmentDay"] = pd.to_datetime(df["AppointmentDay"])

# df["appointment_day"] = df["AppointmentDay"].dt.day_name()

# result = pd.crosstab(
#     df["appointment_day"],
#     df["No-show"],
#     normalize="index"
# ) * 100

# # Arrange days in correct order
# days = [
#     "Monday",
#     "Tuesday",
#     "Wednesday",
#     "Thursday",
#     "Friday",
#     "Saturday",
#     "Sunday"
# ]

# result = result.reindex(days)

# print(result)



# import pandas as pd

# df = pd.read_csv("clinic_operations.csv")

# for column in ["Hipertension", "Diabetes", "Alcoholism", "Handcap"]:

#     result = pd.crosstab(
#         df[column],
#         df["No-show"],
#         normalize="index"
#     ) * 100

#     print(f"\n--- {column} ---")
#     print(result)









import pandas as pd

df = pd.read_csv("clinic_operations.csv")

result = pd.crosstab(
    df["Neighbourhood"],
    df["No-show"],
    normalize="index"
) * 100

result["No-show-Rate"] = result["Yes"]

result = result.sort_values(
    "No-show-Rate",
    ascending=False
)

print(result[["No-show-Rate"]].head(10))