import os
import joblib
import pandas as pd


# =====================================================
# PATH
# =====================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_FILE = os.path.join(
    BASE_DIR,
    "ml",
    "models",
    "delivery_time_model.pkl"
)


# =====================================================
# LOAD MODEL
# =====================================================

def load_model():

    if not os.path.exists(MODEL_FILE):

        raise FileNotFoundError(
            f"Model not found: {MODEL_FILE}"
        )

    return joblib.load(MODEL_FILE)


# =====================================================
# PREDICT DELIVERY TIME
# =====================================================

def predict_delivery_time(
    transport_mode,
    distance_km,
    weight_kg,
    weather,
    traffic
):

    model = load_model()

    input_data = pd.DataFrame([
        {
            "transport_mode": transport_mode,
            "distance_km": distance_km,
            "weight_kg": weight_kg,
            "weather": weather,
            "traffic": traffic
        }
    ])

    prediction = model.predict(input_data)

    delivery_time = float(prediction[0])

    return round(delivery_time, 2)


# =====================================================
# TEST PREDICTION
# =====================================================

if __name__ == "__main__":

    import sys
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print("======================================")
    print(" MailRoute AI Prediction Engine")
    print("======================================")

    try:

        print("\nLoading trained model...")

        load_model()

        print("Model loaded successfully! ✅")

        print("\nRunning test prediction...")

        result = predict_delivery_time(
            transport_mode="Rail",
            distance_km=2200,
            weight_kg=500,
            weather="Clear",
            traffic="Low"
        )

        print("\n--------------------------------------")
        print(" Prediction Result")
        print("--------------------------------------")

        print("Transport Mode :", "Rail")
        print("Distance       :", "2200 km")
        print("Weight         :", "500 kg")
        print("Weather        :", "Clear")
        print("Traffic        :", "Low")

        print("--------------------------------------")

        print(
            f"Predicted Delivery Time : {result} hours"
        )

        print("--------------------------------------")

        print("\nPrediction successful! ✅")

    except Exception as error:

        print("\nPrediction failed!")
        print("Error:", error)

    print("\n======================================")