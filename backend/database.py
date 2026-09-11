import sqlite3
import os


# =====================================================
# DATABASE PATH
# =====================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATABASE_DIR = os.path.join(BASE_DIR, "database")

DATABASE_FILE = os.path.join(
    DATABASE_DIR,
    "mailroute.db"
)


# =====================================================
# CREATE DATABASE DIRECTORY
# =====================================================

if not os.path.exists(DATABASE_DIR):
    os.makedirs(DATABASE_DIR)


# =====================================================
# DATABASE CONNECTION
# =====================================================

def get_connection():

    connection = sqlite3.connect(
        DATABASE_FILE
    )

    connection.row_factory = sqlite3.Row

    return connection


# =====================================================
# INITIALIZE DATABASE
# =====================================================

def initialize_database():

    connection = get_connection()

    cursor = connection.cursor()


    # -------------------------------------------------
    # USERS TABLE
    # -------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            email TEXT UNIQUE NOT NULL,

            password TEXT NOT NULL,

            phone TEXT,

            organization TEXT,

            role TEXT DEFAULT 'Logistics Manager',

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )
    """)


    # -------------------------------------------------
    # SHIPMENTS TABLE
    # -------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS shipments (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            shipment_id TEXT UNIQUE NOT NULL,

            user_id INTEGER,

            source TEXT NOT NULL,

            destination TEXT NOT NULL,

            transport_mode TEXT,

            distance REAL,

            weight REAL,

            status TEXT DEFAULT 'Pending',

            estimated_time REAL,

            transportation_cost REAL,

            delay_risk TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)

        )
    """)


    # -------------------------------------------------
    # ROUTES TABLE
    # -------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS routes (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            shipment_id TEXT NOT NULL,

            transport_mode TEXT NOT NULL,

            source TEXT NOT NULL,

            destination TEXT NOT NULL,

            distance REAL,

            estimated_time REAL,

            estimated_cost REAL,

            delay_probability REAL,

            route_score REAL,

            is_recommended INTEGER DEFAULT 0,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )
    """)


    # -------------------------------------------------
    # TRACKING TABLE
    # -------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tracking (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            shipment_id TEXT NOT NULL,

            status TEXT NOT NULL,

            location TEXT,

            description TEXT,

            progress INTEGER DEFAULT 0,

            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )
    """)


    # -------------------------------------------------
    # PREDICTIONS TABLE
    # -------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            shipment_id TEXT NOT NULL,

            predicted_delivery_time REAL,

            predicted_cost REAL,

            delay_probability REAL,

            delay_risk TEXT,

            recommended_mode TEXT,

            model_version TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )
    """)


    connection.commit()

    connection.close()


# =====================================================
# RUN DATABASE INITIALIZATION
# =====================================================

if __name__ == "__main__":

    initialize_database()

    print("======================================")
    print(" MailRoute AI Database")
    print("======================================")
    print("Database initialized successfully!")
    print(f"Database location: {DATABASE_FILE}")
    print("======================================")