from flask import Blueprint, request, jsonify

from models import (
    create_user,
    get_user_by_email,
    create_shipment,
    get_all_shipments,
    get_shipment,
    update_shipment_status,
    add_tracking_update,
    get_tracking_history,
    get_routes,
    save_prediction,
    get_latest_prediction
)

# =====================================================
# ML MODULE PATH
# =====================================================

import sys
import os

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

ML_PATH = os.path.join(
    BASE_DIR,
    "ml"
)

if ML_PATH not in sys.path:
    sys.path.insert(0, ML_PATH)

# IMPORTANT:
# Your actual file name is route_optimizer.py
from route_optimizer import optimize_route


# =====================================================
# API BLUEPRINT
# =====================================================

api = Blueprint(
    "api",
    __name__,
    url_prefix="/api"
)


# =====================================================
# REGISTER
# =====================================================

@api.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    phone = data.get("phone", "")
    organization = data.get("organization", "")
    role = data.get(
        "role",
        "Logistics Manager"
    )

    if not name or not email or not password:

        return jsonify({
            "success": False,
            "message": "Name, email and password are required"
        }), 400

    result = create_user(
        name,
        email,
        password,
        phone,
        organization,
        role
    )

    if result["success"]:
        return jsonify(result), 201

    return jsonify(result), 409


# =====================================================
# LOGIN
# =====================================================

@api.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:

        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    user = get_user_by_email(email)

    if not user:

        return jsonify({
            "success": False,
            "message": "User not found"
        }), 401

    if user["password"] != password:

        return jsonify({
            "success": False,
            "message": "Invalid password"
        }), 401

    user = dict(user)

    user.pop("password", None)

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": user
    })


# =====================================================
# CREATE SHIPMENT
# =====================================================

@api.route("/shipments", methods=["POST"])
def add_shipment():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400

    shipment_id = data.get("shipment_id")
    user_id = data.get("user_id")

    source = data.get("source")
    destination = data.get("destination")

    transport_mode = data.get(
        "transport_mode"
    )

    distance = data.get(
        "distance",
        0
    )

    weight = data.get(
        "weight",
        0
    )

    status = data.get(
        "status",
        "Pending"
    )

    estimated_time = data.get(
        "estimated_time",
        0
    )

    transportation_cost = data.get(
        "transportation_cost",
        0
    )

    delay_risk = data.get(
        "delay_risk",
        "Low"
    )

    if not shipment_id:

        return jsonify({
            "success": False,
            "message": "Shipment ID is required"
        }), 400

    if not source or not destination:

        return jsonify({
            "success": False,
            "message": "Source and destination are required"
        }), 400

    result = create_shipment(
        shipment_id,
        user_id,
        source,
        destination,
        transport_mode,
        distance,
        weight,
        status,
        estimated_time,
        transportation_cost,
        delay_risk
    )

    if result["success"]:

        return jsonify(result), 201

    return jsonify(result), 409


# =====================================================
# GET ALL SHIPMENTS
# =====================================================

@api.route("/shipments", methods=["GET"])
def shipments():

    shipment_list = get_all_shipments()

    return jsonify({
        "success": True,
        "count": len(shipment_list),
        "shipments": shipment_list
    })


# =====================================================
# GET SINGLE SHIPMENT
# =====================================================

@api.route("/shipments/<shipment_id>", methods=["GET"])
def single_shipment(shipment_id):

    shipment = get_shipment(
        shipment_id
    )

    if not shipment:

        return jsonify({
            "success": False,
            "message": "Shipment not found"
        }), 404

    return jsonify({
        "success": True,
        "shipment": shipment
    })


# =====================================================
# UPDATE SHIPMENT STATUS
# =====================================================

@api.route(
    "/shipments/<shipment_id>/status",
    methods=["PUT"]
)
def shipment_status(shipment_id):

    data = request.get_json()

    if not data or not data.get("status"):

        return jsonify({
            "success": False,
            "message": "Status is required"
        }), 400

    status = data["status"]

    updated = update_shipment_status(
        shipment_id,
        status
    )

    if not updated:

        return jsonify({
            "success": False,
            "message": "Shipment not found"
        }), 404

    return jsonify({
        "success": True,
        "message": "Shipment status updated",
        "shipment_id": shipment_id,
        "status": status
    })


# =====================================================
# ADD TRACKING
# =====================================================

@api.route("/tracking", methods=["POST"])
def add_tracking():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400

    shipment_id = data.get(
        "shipment_id"
    )

    status = data.get(
        "status"
    )

    location = data.get(
        "location",
        ""
    )

    description = data.get(
        "description",
        ""
    )

    progress = data.get(
        "progress",
        0
    )

    if not shipment_id or not status:

        return jsonify({
            "success": False,
            "message": "Shipment ID and status are required"
        }), 400

    tracking_id = add_tracking_update(
        shipment_id,
        status,
        location,
        description,
        progress
    )

    return jsonify({
        "success": True,
        "message": "Tracking update added",
        "tracking_id": tracking_id
    }), 201


# =====================================================
# GET TRACKING HISTORY
# =====================================================

@api.route(
    "/tracking/<shipment_id>",
    methods=["GET"]
)
def tracking_history(shipment_id):

    history = get_tracking_history(
        shipment_id
    )

    return jsonify({
        "success": True,
        "shipment_id": shipment_id,
        "tracking": history
    })


# =====================================================
# GET ROUTES
# =====================================================

@api.route(
    "/routes/<shipment_id>",
    methods=["GET"]
)
def shipment_routes(shipment_id):

    routes = get_routes(
        shipment_id
    )

    return jsonify({
        "success": True,
        "shipment_id": shipment_id,
        "routes": routes
    })


# =====================================================
# AI ROUTE OPTIMIZATION
# =====================================================

@api.route(
    "/optimize-route",
    methods=["POST"]
)
def optimize_route_api():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400

    distance = data.get("distance")
    weight = data.get("weight")

    weather = data.get(
        "weather",
        "Clear"
    )

    traffic = data.get(
        "traffic",
        "Low"
    )

    if distance is None:

        return jsonify({
            "success": False,
            "message": "Distance is required"
        }), 400

    if weight is None:

        return jsonify({
            "success": False,
            "message": "Weight is required"
        }), 400

    try:

        distance = float(distance)
        weight = float(weight)

    except (ValueError, TypeError):

        return jsonify({
            "success": False,
            "message": "Distance and weight must be numbers"
        }), 400

    if distance <= 0:

        return jsonify({
            "success": False,
            "message": "Distance must be greater than zero"
        }), 400

    if weight < 0:

        return jsonify({
            "success": False,
            "message": "Weight cannot be negative"
        }), 400

    try:

        routes = optimize_route(
            distance=distance,
            weight=weight,
            weather=weather,
            traffic=traffic
        )

        if not routes:

            return jsonify({
                "success": False,
                "message": "No routes generated"
            }), 500

        recommended_route = routes[0]

        return jsonify({
            "success": True,
            "message": "Route optimization completed",
            "recommended_route": recommended_route,
            "all_routes": routes
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Route optimization failed",
            "error": str(error)
        }), 500


# =====================================================
# SAVE PREDICTION
# =====================================================

@api.route(
    "/predictions",
    methods=["POST"]
)
def prediction():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400

    required_fields = [
        "shipment_id",
        "predicted_delivery_time",
        "predicted_cost",
        "delay_probability",
        "delay_risk",
        "recommended_mode"
    ]

    for field in required_fields:

        if field not in data:

            return jsonify({
                "success": False,
                "message": f"{field} is required"
            }), 400

    prediction_id = save_prediction(
        data["shipment_id"],
        data["predicted_delivery_time"],
        data["predicted_cost"],
        data["delay_probability"],
        data["delay_risk"],
        data["recommended_mode"],
        data.get(
            "model_version",
            "1.0"
        )
    )

    return jsonify({
        "success": True,
        "message": "Prediction saved",
        "prediction_id": prediction_id
    }), 201


# =====================================================
# GET LATEST PREDICTION
# =====================================================

@api.route(
    "/predictions/<shipment_id>",
    methods=["GET"]
)
def latest_prediction(shipment_id):

    prediction = get_latest_prediction(
        shipment_id
    )

    if not prediction:

        return jsonify({
            "success": False,
            "message": "No prediction found"
        }), 404

    return jsonify({
        "success": True,
        "prediction": prediction
    })


# =====================================================
# API STATUS
# =====================================================

@api.route("/status", methods=["GET"])
def api_status():

    return jsonify({
        "success": True,
        "service": "MailRoute AI API",
        "status": "Running",
        "version": "1.0"
    })