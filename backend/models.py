import sqlite3
from database import get_connection


# =====================================================
# USER FUNCTIONS
# =====================================================

def create_user(
    name,
    email,
    password,
    phone="",
    organization="",
    role="Logistics Manager"
):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute("""
            INSERT INTO users
            (
                name,
                email,
                password,
                phone,
                organization,
                role
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            name,
            email,
            password,
            phone,
            organization,
            role
        ))

        connection.commit()

        user_id = cursor.lastrowid

        return {
            "success": True,
            "user_id": user_id,
            "message": "User created successfully"
        }

    except sqlite3.IntegrityError:

        return {
            "success": False,
            "message": "Email already exists"
        }

    finally:

        connection.close()


# =====================================================
# GET USER BY EMAIL
# =====================================================

def get_user_by_email(email):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM users
        WHERE email = ?
    """, (email,))

    user = cursor.fetchone()

    connection.close()

    if user:

        return dict(user)

    return None


# =====================================================
# SHIPMENT FUNCTIONS
# =====================================================

def create_shipment(
    shipment_id,
    user_id,
    source,
    destination,
    transport_mode=None,
    distance=0,
    weight=0,
    status="Pending",
    estimated_time=0,
    transportation_cost=0,
    delay_risk="Low"
):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute("""
            INSERT INTO shipments
            (
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
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
        ))

        connection.commit()

        return {
            "success": True,
            "message": "Shipment created successfully",
            "shipment_id": shipment_id
        }

    except sqlite3.IntegrityError:

        return {
            "success": False,
            "message": "Shipment ID already exists"
        }

    finally:

        connection.close()


# =====================================================
# GET ALL SHIPMENTS
# =====================================================

def get_all_shipments():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM shipments
        ORDER BY created_at DESC
    """)

    shipments = cursor.fetchall()

    connection.close()

    return [
        dict(shipment)
        for shipment in shipments
    ]


# =====================================================
# GET SINGLE SHIPMENT
# =====================================================

def get_shipment(shipment_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM shipments
        WHERE shipment_id = ?
    """, (shipment_id,))

    shipment = cursor.fetchone()

    connection.close()

    if shipment:

        return dict(shipment)

    return None


# =====================================================
# UPDATE SHIPMENT STATUS
# =====================================================

def update_shipment_status(
    shipment_id,
    status
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE shipments
        SET status = ?
        WHERE shipment_id = ?
    """, (
        status,
        shipment_id
    ))

    connection.commit()

    updated = cursor.rowcount > 0

    connection.close()

    return updated


# =====================================================
# ROUTE FUNCTIONS
# =====================================================

def create_route(
    shipment_id,
    transport_mode,
    source,
    destination,
    distance,
    estimated_time,
    estimated_cost,
    delay_probability,
    route_score,
    is_recommended=0
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO routes
        (
            shipment_id,
            transport_mode,
            source,
            destination,
            distance,
            estimated_time,
            estimated_cost,
            delay_probability,
            route_score,
            is_recommended
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        shipment_id,
        transport_mode,
        source,
        destination,
        distance,
        estimated_time,
        estimated_cost,
        delay_probability,
        route_score,
        is_recommended
    ))

    connection.commit()

    route_id = cursor.lastrowid

    connection.close()

    return route_id


# =====================================================
# GET ROUTES FOR SHIPMENT
# =====================================================

def get_routes(shipment_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM routes
        WHERE shipment_id = ?
        ORDER BY route_score DESC
    """, (shipment_id,))

    routes = cursor.fetchall()

    connection.close()

    return [
        dict(route)
        for route in routes
    ]


# =====================================================
# TRACKING FUNCTIONS
# =====================================================

def add_tracking_update(
    shipment_id,
    status,
    location="",
    description="",
    progress=0
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO tracking
        (
            shipment_id,
            status,
            location,
            description,
            progress
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        shipment_id,
        status,
        location,
        description,
        progress
    ))

    connection.commit()

    tracking_id = cursor.lastrowid

    connection.close()

    return tracking_id


# =====================================================
# GET TRACKING HISTORY
# =====================================================

def get_tracking_history(
    shipment_id
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM tracking
        WHERE shipment_id = ?
        ORDER BY updated_at ASC
    """, (shipment_id,))

    tracking = cursor.fetchall()

    connection.close()

    return [
        dict(item)
        for item in tracking
    ]


# =====================================================
# PREDICTION FUNCTIONS
# =====================================================

def save_prediction(
    shipment_id,
    predicted_delivery_time,
    predicted_cost,
    delay_probability,
    delay_risk,
    recommended_mode,
    model_version="1.0"
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO predictions
        (
            shipment_id,
            predicted_delivery_time,
            predicted_cost,
            delay_probability,
            delay_risk,
            recommended_mode,
            model_version
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        shipment_id,
        predicted_delivery_time,
        predicted_cost,
        delay_probability,
        delay_risk,
        recommended_mode,
        model_version
    ))

    connection.commit()

    prediction_id = cursor.lastrowid

    connection.close()

    return prediction_id


# =====================================================
# GET LATEST PREDICTION
# =====================================================

def get_latest_prediction(
    shipment_id
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM predictions
        WHERE shipment_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    """, (shipment_id,))

    prediction = cursor.fetchone()

    connection.close()

    if prediction:

        return dict(prediction)

    return None


# =====================================================
# DATABASE TEST
# =====================================================

if __name__ == "__main__":

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        ORDER BY name
    """)

    tables = cursor.fetchall()

    connection.close()

    print("======================================")
    print(" MailRoute AI Models")
    print("======================================")
    print("Database connection successful!")
    print()
    print("Available tables:")

    for table in tables:

        print("✓", table["name"])

    print("======================================")