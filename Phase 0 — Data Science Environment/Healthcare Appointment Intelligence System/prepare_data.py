import pandas as pd

df = pd.read_csv("clinic_operations.csv")

# Convert dates
df["ScheduledDay"] = pd.to_datetime(df["ScheduledDay"])
df["AppointmentDay"] = pd.to_datetime(df["AppointmentDay"])

# Calculate waiting days
df["waiting_days"] = (
    df["AppointmentDay"].dt.normalize()
    - df["ScheduledDay"].dt.normalize()
).dt.days

# Remove invalid ages
df = df[df["Age"] >= 0]

# Remove impossible waiting days
df = df[df["waiting_days"] >= 0]

print("Dataset shape:", df.shape)
print("\nMissing values:")
print(df.isnull().sum())

print("\nAge statistics:")
print(df["Age"].describe())

print("\nWaiting days statistics:")
print(df["waiting_days"].describe())



import pandas as pd

# Load cleaned data
df = pd.read_csv("clinic_operations.csv")

# Convert dates
df["ScheduledDay"] = pd.to_datetime(df["ScheduledDay"])
df["AppointmentDay"] = pd.to_datetime(df["AppointmentDay"])

# Create waiting days
df["waiting_days"] = (
    df["AppointmentDay"].dt.normalize()
    - df["ScheduledDay"].dt.normalize()
).dt.days

# Remove invalid values
df = df[df["Age"] >= 0]
df = df[df["waiting_days"] >= 0]

# Create useful time features
df["appointment_day"] = df["AppointmentDay"].dt.dayofweek
df["appointment_month"] = df["AppointmentDay"].dt.month
df["appointment_hour"] = df["AppointmentDay"].dt.hour

# Convert target
df["No-show"] = df["No-show"].map({
    "No": 0,
    "Yes": 1
})

# Select features
features = [
    "Age",
    "Scholarship",
    "Hipertension",
    "Diabetes",
    "Alcoholism",
    "Handcap",
    "SMS_received",
    "waiting_days",
    "appointment_day",
    "appointment_month",
    "appointment_hour"
]

X = df[features]
y = df["No-show"]

print("X shape:", X.shape)
print("y shape:", y.shape)

print("\nFeatures:")
print(X.head())

print("\nTarget:")
print(y.value_counts())








import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv("clinic_operations.csv")

# Dates
df["ScheduledDay"] = pd.to_datetime(df["ScheduledDay"])
df["AppointmentDay"] = pd.to_datetime(df["AppointmentDay"])

# Waiting days
df["waiting_days"] = (
    df["AppointmentDay"].dt.normalize()
    - df["ScheduledDay"].dt.normalize()
).dt.days

# Clean data
df = df[df["Age"] >= 0]
df = df[df["waiting_days"] >= 0]

# Time features
df["appointment_day"] = df["AppointmentDay"].dt.dayofweek
df["appointment_month"] = df["AppointmentDay"].dt.month
df["appointment_hour"] = df["AppointmentDay"].dt.hour

# Target
df["No-show"] = df["No-show"].map({
    "No": 0,
    "Yes": 1
})

# Features
features = [
    "Age",
    "Scholarship",
    "Hipertension",
    "Diabetes",
    "Alcoholism",
    "Handcap",
    "SMS_received",
    "waiting_days",
    "appointment_day",
    "appointment_month",
    "appointment_hour"
]

X = df[features]
y = df["No-show"]

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))

print("\nTraining target:")
print(y_train.value_counts())

print("\nTesting target:")
print(y_test.value_counts())









from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score
)
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score
)

# Create model
model = LogisticRegression(max_iter=1000)

# Train model
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Probability of No-show
y_probability = model.predict_proba(X_test)[:, 1]

# Evaluate
print("\n--- Logistic Regression Results ---")

print("Accuracy :", accuracy_score(y_test, y_pred))
print("Precision:", precision_score(y_test, y_pred))
print("Recall   :", recall_score(y_test, y_pred))
print("F1 Score :", f1_score(y_test, y_pred))
print("ROC-AUC  :", roc_auc_score(y_test, y_probability))


from sklearn.ensemble import RandomForestClassifier


rf_model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1
)

rf_model.fit(X_train, y_train)

rf_pred = rf_model.predict(X_test)

rf_probability = rf_model.predict_proba(X_test)[:, 1]

print("\n--- Random Forest Results ---")

print("Accuracy :", accuracy_score(y_test, rf_pred))
print("Precision:", precision_score(y_test, rf_pred))
print("Recall   :", recall_score(y_test, rf_pred))
print("F1 Score :", f1_score(y_test, rf_pred))
print("ROC-AUC  :", roc_auc_score(y_test, rf_probability))







from xgboost import XGBClassifier

xgb_model = XGBClassifier(
    n_estimators=300,
    max_depth=5,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric="logloss",
    random_state=42
)

xgb_model.fit(X_train, y_train)

xgb_pred = xgb_model.predict(X_test)

xgb_probability = xgb_model.predict_proba(X_test)[:, 1]

print("\n--- XGBoost Results ---")

print("Accuracy :", accuracy_score(y_test, xgb_pred))
print("Precision:", precision_score(y_test, xgb_pred))
print("Recall   :", recall_score(y_test, xgb_pred))
print("F1 Score :", f1_score(y_test, xgb_pred))
print("ROC-AUC  :", roc_auc_score(y_test, xgb_probability))