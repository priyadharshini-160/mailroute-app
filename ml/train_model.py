import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor


# =====================================================
# PATHS
# =====================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

DATA_FILE = os.path.join(
    BASE_DIR,
    "data",
    "transportation_data.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "ml",
    "models"
)

MODEL_FILE = os.path.join(
    MODEL_DIR,
    "delivery_time_model.pkl"
)


# =====================================================
# CREATE MODEL DIRECTORY
# =====================================================

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)


# =====================================================
# LOAD DATASET
# =====================================================

print("======================================")
print(" MailRoute AI - ML Training")
print("======================================")

print("\nLoading dataset...")

if not os.path.exists(DATA_FILE):

    print("ERROR: Dataset not found!")
    print(f"Expected location: {DATA_FILE}")
    exit()

data = pd.read_csv(DATA_FILE)

print("Dataset loaded successfully!")
print(f"Rows: {len(data)}")
print(f"Columns: {len(data.columns)}")


# =====================================================
# REQUIRED COLUMNS
# =====================================================

required_columns = [
    "transport_mode",
    "distance_km",
    "weight_kg",
    "weather",
    "traffic",
    "delivery_time_hours"
]


missing_columns = [
    column
    for column in required_columns
    if column not in data.columns
]


if missing_columns:

    print("\nERROR: Missing columns:")

    for column in missing_columns:
        print("-", column)

    exit()


# =====================================================
# REMOVE MISSING VALUES
# =====================================================

data = data.dropna()

print(f"\nRows after cleaning: {len(data)}")


# =====================================================
# FEATURES
# =====================================================

X = data[
    [
        "transport_mode",
        "distance_km",
        "weight_kg",
        "weather",
        "traffic"
    ]
]


# =====================================================
# TARGET
# =====================================================

y = data[
    "delivery_time_hours"
]


# =====================================================
# CATEGORICAL FEATURES
# =====================================================

categorical_features = [
    "transport_mode",
    "weather",
    "traffic"
]


numeric_features = [
    "distance_km",
    "weight_kg"
]


# =====================================================
# PREPROCESSING
# =====================================================

preprocessor = ColumnTransformer(

    transformers=[

        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_features
        ),

        (
            "numeric",
            "passthrough",
            numeric_features
        )

    ]
)


# =====================================================
# ML MODEL
# =====================================================

model = RandomForestRegressor(
    n_estimators=150,
    random_state=42
)


# =====================================================
# PIPELINE
# =====================================================

pipeline = Pipeline(

    steps=[

        (
            "preprocessor",
            preprocessor
        ),

        (
            "model",
            model
        )

    ]
)


# =====================================================
# TRAIN TEST SPLIT
# =====================================================

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.2,

    random_state=42
)


print("\nTraining ML model...")


# =====================================================
# TRAIN
# =====================================================

pipeline.fit(
    X_train,
    y_train
)


# =====================================================
# MODEL SCORE
# =====================================================

score = pipeline.score(
    X_test,
    y_test
)


print("\nModel training completed!")

print(
    f"Model R² Score: {score:.2f}"
)


# =====================================================
# SAVE MODEL
# =====================================================

joblib.dump(
    pipeline,
    MODEL_FILE
)


print("\nModel saved successfully!")

print(
    f"Model location: {MODEL_FILE}"
)


# =====================================================
# FINAL MESSAGE
# =====================================================

print("\n======================================")
print(" ML TRAINING COMPLETED")
print("======================================")