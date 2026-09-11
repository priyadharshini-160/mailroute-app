# MailRoute AI – Intelligent Route Selection & Logistics Optimization

MailRoute AI is an intelligent, multimodal transportation route selection and logistics optimization platform. It compares transportation modes (**Road**, **Rail**, **Air**, and **Water**) and utilizes Machine Learning predictions to evaluate delivery times, transport costs, and delay risks.

---

## 🌟 Key Features

- **User Authentication**: Register & Login with secure session management.
- **Intelligent Route Optimization**: Evaluate and rank multimodal routes based on distance, cargo weight, shipment priority, weather conditions, and traffic congestion.
- **AI Recommendation Engine**: Machine Learning model (`delivery_time_model.pkl`) predicts delivery time and cost.
- **Shipment Management & Database**: Create, view, search, and filter shipments.
- **Live Tracking**: Monitor shipment journey progress, active status, ETA, and AI delay risk warnings.
- **Analytics & Reports**: Visual KPI dashboard, transport mix overview, and CSV report export.
- **GitHub Pages & Local Host Dual Mode**: Works 100% statically on GitHub Pages as well as with Python Flask backend locally.

---

## 📁 Project Structure

```text
AI-Mail-Route-Optimization/
│
├── index.html              # Homepage (GitHub Pages root entrypoint)
├── README.md               # Setup & deployment documentation
├── requirements.txt        # Backend Python dependencies
│
├── pages/                  # Main Application Frontend Pages
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── shipment.html
│   ├── route.html
│   ├── tracking.html
│   ├── reports.html
│   └── profile.html
│
├── css/                    # Modular Stylesheets
│   ├── style.css
│   ├── login.css
│   ├── register.css
│   ├── dashboard.css
│   ├── shipment.css
│   ├── route.css
│   ├── tracking.css
│   ├── reports.css
│   └── profile.css
│
├── js/                     # Application & API Integration Scripts
│   ├── config.js           # API health detector & client ML fallback engine
│   ├── login.js
│   ├── register.js
│   ├── dashboard.js
│   ├── shipment.js
│   ├── route.js
│   ├── tracking.js
│   ├── reports.js
│   └── profile.js
│
├── backend/                # Python Flask API Server
│   ├── app.py              # Main Flask application server
│   ├── routes.py           # API Endpoints
│   ├── models.py           # Database models
│   ├── database.py         # SQLite connection & table creation
│   └── requirements.txt
│
├── ml/                     # Machine Learning Engine
│   ├── route_optimizer.py  # Route optimization logic
│   ├── prediction.py       # ML prediction script
│   ├── train_model.py      # Model training script
│   └── models/
│       └── delivery_time_model.pkl
│
├── database/               # SQLite Database Storage
│   └── mailroute.db
│
└── data/                   # Data Resources
    ├── locations.csv
    ├── routes.csv
    ├── shipments.csv
    └── transportation_data.csv
```

---

## 🚀 How to Run Locally

### 1. Run the Frontend Only (Static Mode)
Simply open `index.html` or `pages/login.html` directly in any web browser (or use Live Server / VS Code extension).

The application automatically detects when the Flask backend is not running and executes all features (including AI route optimization and database storage) seamlessly using built-in client-side ML logic and LocalStorage.

---

### 2. Run with Python Flask Backend & ML Engine

1. Open your terminal in the project directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   py -m pip install -r requirements.txt
   ```

3. Initialize the SQLite database:
   ```bash
   py database.py
   ```

4. Start the Flask server:
   ```bash
   py app.py
   ```

5. Backend URL:
   ```text
   http://127.0.0.1:5000
   ```

Now open `http://127.0.0.1:5000` in your web browser. All frontend requests will automatically communicate with the active Flask backend API and SQLite database (`mailroute.db`).

---

## 🌐 How to Deploy to GitHub Pages

1. Push your complete project repository to **GitHub**.
2. In your repository on GitHub, click **Settings**.
3. In the left menu, select **Pages**.
4. Under **Build and deployment** -> **Branch**:
   - Select **`main`** (or `master`).
   - Select **`/ (root)`** as the source folder.
5. Click **Save**.
6. Wait 1-2 minutes. Your live static site will be available at:
   `https://<your-github-username>.github.io/<repository-name>/`

---

## 💻 Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla CSS with Custom Design System), Vanilla JavaScript (ES6+)
- **Backend**: Python 3, Flask, Flask-CORS
- **Database**: SQLite3
- **Machine Learning**: Scikit-Learn, Pandas, Joblib

---

## 📄 License

© 2026 MailRoute AI. Intelligent Multimodal Mail Transmission & Route Optimization System. All rights reserved.


## Public Demo Mode
The GitHub Pages version is a student demonstration site. It uses Demo Access / Demo Profile and does not request or store passwords or other real account credentials in the public frontend.
