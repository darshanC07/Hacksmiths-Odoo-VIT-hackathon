from flask import Flask, jsonify, request
from firebase_admin import credentials, initialize_app, db, auth 
from os import urandom, getenv
import os
import requests
import json
from flask_cors import CORS
from dotenv import load_dotenv

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

if __name__ == "__main__":
    app.run(debug=True)