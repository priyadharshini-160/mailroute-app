import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from routes import api

# =====================================================
# PATHS CONFIGURATION
# =====================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
PAGES_DIR = os.path.join(PROJECT_DIR, "pages")
FRONTEND_DIR = os.path.join(PROJECT_DIR, "frontend")
CSS_DIR = os.path.join(PROJECT_DIR, "css")
JS_DIR = os.path.join(PROJECT_DIR, "js")

# =====================================================
# FLASK APP INITIALIZATION
# =====================================================
app = Flask(__name__)
CORS(app)

# Register API Blueprint
app.register_blueprint(api)

# Helper to find static html page in pages/ or frontend/
def serve_page(filename):
    if os.path.exists(os.path.join(PAGES_DIR, filename)):
        return send_from_directory(PAGES_DIR, filename)
    elif os.path.exists(os.path.join(FRONTEND_DIR, filename)):
        return send_from_directory(FRONTEND_DIR, filename)
    return jsonify({"error": "Page not found"}), 404

# =====================================================
# STATIC PAGE ROUTES
# =====================================================
@app.route("/")
def home_page():
    root_index = os.path.join(PROJECT_DIR, "index.html")
    if os.path.exists(root_index):
        return send_from_directory(PROJECT_DIR, "index.html")
    return serve_page("index.html")

@app.route("/index.html")
def root_index_page():
    return home_page()

@app.route("/pages/<filename>")
def serve_pages_folder(filename):
    return serve_page(filename)

@app.route("/login.html")
def login_page():
    return serve_page("login.html")

@app.route("/register.html")
def register_page():
    return serve_page("register.html")

@app.route("/dashboard.html")
def dashboard_page():
    return serve_page("dashboard.html")

@app.route("/shipment.html")
def shipment_page():
    return serve_page("shipment.html")

@app.route("/route.html")
def route_page():
    return serve_page("route.html")

@app.route("/route-result.html")
def route_result_page():
    return serve_page("route.html")

@app.route("/tracking.html")
def tracking_page():
    return serve_page("tracking.html")

@app.route("/reports.html")
def reports_page():
    return serve_page("reports.html")

@app.route("/profile.html")
def profile_page():
    return serve_page("profile.html")

# =====================================================
# CSS & JS STATIC SERVING
# =====================================================
@app.route("/css/<path:filename>")
def css_files(filename):
    return send_from_directory(CSS_DIR, filename)

@app.route("/js/<path:filename>")
def js_files(filename):
    return send_from_directory(JS_DIR, filename)

# =====================================================
# API STATUS & HEALTH ENDPOINTS
# =====================================================
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "success": True,
        "message": "MailRoute AI Backend is healthy",
        "status": "healthy"
    })

@app.route("/api/ai/status", methods=["GET"])
def ai_status():
    return jsonify({
        "success": True,
        "service": "MailRoute AI Prediction Engine",
        "status": "Ready",
        "features": [
            "Delivery Time Prediction",
            "Transportation Cost Prediction",
            "Delay Risk Prediction",
            "Smart Multimodal Route Optimization"
        ]
    })

@app.route("/api/transport-modes", methods=["GET"])
def transport_modes():
    modes = [
        {"id": 1, "mode": "Road", "icon": "🚚"},
        {"id": 2, "mode": "Rail", "icon": "🚆"},
        {"id": 3, "mode": "Air", "icon": "✈️"},
        {"id": 4, "mode": "Water", "icon": "🚢"}
    ]
    return jsonify({
        "success": True,
        "modes": modes
    })

# =====================================================
# START FLASK SERVER
# =====================================================
if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )