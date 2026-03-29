from flask import Flask, jsonify, request
from firebase_admin import credentials, initialize_app, db, auth 
from os import urandom, getenv
import os
import requests
import json
from flask_cors import CORS
from dotenv import load_dotenv
from ocr_engine import process_receipt_image

load_dotenv(".env")

app = Flask(__name__)
app.secret_key = getenv("FLASK_SECRET_KEY", urandom(32).hex())
API_KEY = getenv("apiKey")
CORS(app,supports_credentials=True)


cred = credentials.Certificate({
    "type": getenv("type"),
    "project_id" : getenv("project_id"),
    "private_key_id": getenv("private_key_id"),
    "private_key": getenv("private_key"),
    "client_email": getenv("client_email"),
    "client_id": getenv("client_id"),
    "auth_uri": getenv("auth_uri"),
    "token_uri": getenv("token_uri"),
    "auth_provider_x509_cert_url": getenv("auth_provider_x509_cert_url"),
    "client_x509_cert_url": getenv("client_x509_cert_url"),
    "universe_domain": getenv("universe_domain")
})

initialize_app(cred, {
    'databaseURL': os.getenv("DATABASE_URL")
})
ref = db.reference("/")

active_users = {}


@app.route("/", methods=["GET"])
def main():
    return jsonify({"message": "Hello, World!"}),200

@app.route("/admin-register", methods=["POST"])
def admin_register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    company = data.get("company")
    country = data.get("country")
    
    companyCode = company if len(company) <= 3 else company[:3]
    companyCode = companyCode.upper()
    
    
    try:
        user = auth.create_user(
            uid = f"{companyCode}_ADMIN",
            email=email,
            password=password
        )
        print(f"Successfully created new user: {user.uid}")
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"
        payload = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }
        response = requests.post(url, json=payload)
        
        userData = {
            "email": email,
            "uid": user.uid,
            "name": name,
            "company": company,
            "country": country,
        }
        print(response.json())
        if response.status_code == 200:
            ref.child(company).child("admin").set(userData)
            return jsonify({"message": "ADMIN created successfully", "uid": user.uid}), 201
        else:
            auth.delete_user(user.uid)
            return jsonify({"error": "Failed to authenticate user after creation"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    company = data.get("company").upper()
    
    try :
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"
        payload = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            user = auth.get_user_by_email(email)
            print("logged in ",user.uid)
            if role == "admin":
                user_info  = ref.child(company).child("admin").get()
                print("found : ",user_info)
            elif role == "employee":
                user_info  = ref.child(company).child("employee").child(user.uid).get()
            elif role == "manager":
                user_info  = ref.child(company).child("manager").child(user.uid).get()
            print(user_info)
            print(type(user_info))
            if not user_info:
                return jsonify({"error": "USER_NOT_FOUND"}), 404
            
            return jsonify({"message": "Login successful!",
                            "code": 200, 
                            "user": {
                                'email': user.email,
                                'uid': user.uid,
                                'name': user_info.get("name",f"{role.upper}_USER"),
            }})
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

@app.route("/scan", methods=["POST"])
def scan_receipt():
    """
    OCR Endpoint for Employees to scan receipts.
    Auto-generates: Amount, Date, Vendor, and Description.
    """
    # Check if the file part is in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        try:
            # Read image bytes directly from the Flask file storage
            image_bytes = file.read()
            
            # Call your OCR engine logic
            data = process_receipt_image(image_bytes)
            
            if not data:
                return jsonify({"error": "OCR could not detect text"}), 422

            # Return the auto-generated expense data
            return jsonify({
                "message": "Receipt scanned successfully",
                "data": data
            }), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)