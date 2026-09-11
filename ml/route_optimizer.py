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
# AVAILABLE TRANSPORT MODES
# =====================================================

TRANSPORT_MODES = [
    "Road",
    "Rail",
    "Air",
    "Water"
]


# =====================================================
# COST FACTORS
# =====================================================

COST_FACTORS = {
    "Road": 12,
    "Rail": 8,
    "Air": 35,
    "Water": 5
}


# =====================================================
# DELAY FACTORS
# =====================================================

DELAY_FACTORS = {
    "Road": 0.20,
    "Rail": 0.10,
    "Air": 0.06,
    "Water": 0.18
}


# =====================================================
# LOAD ML MODEL
# =====================================================

def load_model():

    if not os.path.exists(MODEL_FILE):

        raise FileNotFoundError(
            f"ML model not found: {MODEL_FILE}"
        )

    return joblib.load(MODEL_FILE)


# =====================================================
# PREDICT DELIVERY TIME
# =====================================================

def predict_time(
    model,
    mode,
    distance,
    weight,
    weather,
    traffic
):

    data = pd.DataFrame([
        {
            "transport_mode": mode,
            "distance_km": distance,
            "weight_kg": weight,
            "weather": weather,
            "traffic": traffic
        }
    ])

    prediction = model.predict(data)

    return round(
        float(prediction[0]),
        2
    )


# =====================================================
# CALCULATE COST
# =====================================================

def calculate_cost(
    mode,
    distance,
    weight
):

    base_cost = (
        distance *
        COST_FACTORS[mode]
    )

    weight_cost = (
        weight * 0.5
    )

    return round(
        base_cost + weight_cost,
        2
    )


# =====================================================
# CALCULATE DELAY RISK
# =====================================================

def calculate_delay(
    mode,
    weather,
    traffic
):

    risk = DELAY_FACTORS[mode]

    if weather == "Rain":
        risk += 0.08

    elif weather == "Storm":
        risk += 0.20

    if traffic == "Medium":
        risk += 0.05

    elif traffic == "High":
        risk += 0.12

    return round(
        min(risk, 0.95),
        2
    )


# =====================================================
# CALCULATE ROUTE SCORE
# =====================================================

def calculate_score(
    delivery_time,
    cost,
    delay_probability
):

    time_score = max(
        0,
        100 - delivery_time
    )

    cost_score = max(
        0,
        100 - (cost / 1000)
    )

    delay_score = (
        100 -
        (delay_probability * 100)
    )

    score = (
        time_score * 0.40 +
        cost_score * 0.30 +
        delay_score * 0.30
    )

    return round(
        min(score, 100),
        2
    )


# =====================================================
# OPTIMIZE ROUTE
# =====================================================

def optimize_route(
    distance,
    weight,
    weather="Clear",
    traffic="Low"
):

    model = load_model()

    results = []

    for mode in TRANSPORT_MODES:

        delivery_time = predict_time(
            model,
            mode,
            distance,
            weight,
            weather,
            traffic
        )

        cost = calculate_cost(
            mode,
            distance,
            weight
        )

        delay_probability = calculate_delay(
            mode,
            weather,
            traffic
        )

        route_score = calculate_score(
            delivery_time,
            cost,
            delay_probability
        )

        results.append({
            "transport_mode": mode,
            "distance_km": distance,
            "weight_kg": weight,
            "estimated_time_hours": delivery_time,
            "estimated_cost": cost,
            "delay_probability": delay_probability,
            "route_score": route_score
        })

    results.sort(
        key=lambda x: x["route_score"],
        reverse=True
    )

    results[0]["is_recommended"] = True

    for result in results[1:]:
        result["is_recommended"] = False

    return results


# =====================================================
# TEST
# =====================================================

if __name__ == "__main__":

    import sys
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print("======================================")
    print(" MailRoute AI Route Optimization")
    print("======================================")

    try:

        routes = optimize_route(
            distance=2200,
            weight=500,
            weather="Clear",
            traffic="Low"
        )

        print("\nRoute Comparison")
        print("--------------------------------------")

        for route in routes:

            recommended = ""

            if route["is_recommended"]:
                recommended = " ⭐ RECOMMENDED"

            print(
                f"\nMode       : {route['transport_mode']}"
            )

            print(
                f"Time       : {route['estimated_time_hours']} hours"
            )

            print(
                f"Cost       : ₹{route['estimated_cost']}"
            )

            print(
                f"Delay Risk : {route['delay_probability'] * 100:.1f}%"
            )

            print(
                f"Score      : {route['route_score']}"
                f"{recommended}"
            )

        print("\n======================================")
        print(" Route Optimization Completed")
        print("======================================")

    except Exception as error:

        print("\nRoute optimization failed!")
        print("Error:", error)