from flask import Flask, jsonify, request
from firebase_admin import credentials, initialize_app, db, auth 
from os import urandom, getenv
import os
import requests
import json
from flask_cors import CORS
from dotenv import load_dotenv
from ocr_engine import process_receipt_image
from werkzeug.utils import secure_filename

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
    
    os.makedirs(f"company/{companyCode}", exist_ok=True)
    
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


@app.route("/get-manager", methods=["GET"])
def get_manager():
    company = request.args.get("company").upper()
    try:
        managers = ref.child(company).child("manager").get()
        if not managers:
            return jsonify({"error": "No managers found for this company","data" : []}), 404
        
        manager_list = []
        for manager_id, manager_info in managers.items():
            manager_list.append({
                "uid": manager_info.get("uid"),
                "name": manager_info.get("name"),
                "email": manager_info.get("email")
            })
        return jsonify({"message": "Managers retrieved successfully", "data": manager_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/add-member", methods=["POST"])
def add_member():
    data = request.get_json()
    email = data.get("email")
    name = data.get("name")
    role = data.get("role")
    company = data.get("company").upper()
    manager_uid = data.get("manager_uid") if role == "employee" else None
    
    password = urandom(16).hex()  
    
    try:
        user = auth.create_user(
            email=email,
            password=password
        )
        print(f"Successfully created new user: {user.uid}")
        if role == "employee":
            employee_data = {
                "email": email,
                "uid": user.uid,
                "name": name,
                "manager_uid": manager_uid
            }
            
            ref.child(company).child(role).child(user.uid).set(employee_data)
        
        elif role == "manager":
            manager_data = {
                "email": email,
                "uid": user.uid,
                "name": name,
            }
            ref.child(company).child(role).child(user.uid).set(manager_data)
            
        return jsonify({"message": f"{role.upper()} created successfully", "uid": user.uid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/submit-reimbursement", methods=["POST"])
def submit_reimbursement():
    data = request.form
    employee_uid = data.get("employee_uid")
    title = data.get("title")
    company = data.get("company").upper()
    amount = data.get("amount")
    curr_type = data.get("currency")
    date = data.get("date")
    category = data.get("category")
    paid_by = data.get("paid_by")
    description = data.get("description")
    approver_uid = data.get("approver_uid")
    
    
    try:
        if "receipt" not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files["receipt"]

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        filename = secure_filename(file.filename)
        
        dir_path = os.path.join("company", company[:3], employee_uid)
        os.makedirs(dir_path, exist_ok=True)

        filepath = os.path.join(dir_path, filename)
        file.save(filepath)
    
        reimbursement_data = {
            "employee_uid": employee_uid,
            "approver_uid": approver_uid,
            "amount": amount,
            "date": date,
            "currency": curr_type,
            "category": category,
            "paid_by": paid_by,
            "title": title,
            "receipt_path": filepath,
            "description": description,
            "status": "pending"
        }
        
        new_reimbursement_ref = ref.child(company).child("reimbursements").push(reimbursement_data)
        
        ref.child(company).child("employee").child(employee_uid).child("reimbursements").push(new_reimbursement_ref.key)
        
        ref.child(company).child("manager").child(approver_uid).child("reimbursements_req").push(new_reimbursement_ref.key)
        
        return jsonify({"message": "Reimbursement submitted successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/get-company-members", methods=["GET"])
def get_company_members():
    company = request.args.get("company").upper()
    try:
        employees = ref.child(company).child("employee").get() or {}
        managers = ref.child(company).child("manager").get() or {}
        
        employee_list = []
        for emp_id, emp_info in employees.items():
            employee_list.append({
                "uid": emp_info.get("uid"),
                "name": emp_info.get("name"),
                "email": emp_info.get("email"),
            })
        
        manager_list = []
        for mgr_id, mgr_info in managers.items():
            manager_list.append({
                "uid": mgr_info.get("uid"),
                "name": mgr_info.get("name"),
                "email": mgr_info.get("email"),
            })
        
        
        return jsonify({"message": "Company members retrieved successfully", "data": {"employees" : employee_list, "managers" : manager_list}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/reimbursement-req", methods=["GET"])
def get_reimbursement_requests():
    company = request.args.get("company").upper()
    manager_uid = request.args.get("manager") if request.args.get("manager") else None
    employee_uid = request.args.get("employee") if request.args.get("employee") else None
    
    try:
        if employee_uid:
            reimbursement_ids = ref.child(company).child("employee").child(employee_uid).child("reimbursements").get() or {}
        else:
            reimbursement_ids = ref.child(company).child("manager").child(manager_uid).child("reimbursements_req").get() or {}
        
        reimbursements = []
        if not reimbursement_ids:
            if employee_uid:
                return jsonify({"message": "No reimbursement requests found for this employee", "data": []}), 200
            else:
                return jsonify({"message": "No reimbursement requests found for this manager", "data": []}), 200
        
        for req_id in reimbursement_ids.values():
            req_info = ref.child(company).child("reimbursements").child(req_id).get()
            if req_info:
                reimbursements.append({
                    "id": req_id,
                    "employee_uid": req_info.get("employee_uid"),
                    "approver_uid": req_info.get("approver_uid"),
                    "amount": req_info.get("amount"),
                    "date": req_info.get("date"),
                    "currency": req_info.get("currency"),
                    "category": req_info.get("category"),
                    "paid_by": req_info.get("paid_by"),
                    "title": req_info.get("title"),
                    "description": req_info.get("description"),
                    "status": req_info.get("status")
                })
        
        return jsonify({"message": "Reimbursement requests retrieved successfully", "data": reimbursements}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400



if __name__ == "__main__":
    app.run(debug=True)