from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash

from flask_cors import CORS


# Initialize Flask app
app = Flask(__name__)


# Enable CORS for your Flask app
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["fitness_app"]

# Home route to verify the API is running
@app.route('/')
def home():
    return "Welcome to the Fitness App API!"

# Route to create a new user (signup)
@app.route('/api/signup', methods=['POST'])
def signup():
    print("Signup route hit")  # Debug statement
    data = request.json
    
    # Check if email already exists
    if db.users.find_one({"email": data["email"]}):
        return jsonify({"error": "Email already exists"}), 400

        # Validate password presence
    if "password" not in data or not data["password"]:
        return jsonify({"error": "Password is required"}), 400

    # Use pbkdf2 explicitly to hash the password
    data["password"] = generate_password_hash(data["password"], method='pbkdf2:sha256', salt_length=8)
    result = db.users.insert_one(data)
    return jsonify({"message": "User created", "user_id": str(result.inserted_id)}), 201

    # Add dietary preferences with a default empty list if not provided
    if "dietary_preferences" not in data:
        data["dietary_preferences"] = []

# Route to log in a user
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json

    # Check if email and password are provided
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password are required"}), 400

    # Find user by email
    user = db.users.find_one({"email": data["email"]})
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    # Check password
    if not check_password_hash(user["password"], data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({"message": "Login successful", "user_id": str(user["_id"])}), 200

# Route to get user details by ID
@app.route('/api/users/<id>', methods=['GET'])
def get_user(id):
    user = db.users.find_one({"_id": ObjectId(id)}, {"password": 0})  # Exclude password from response
    if user:
        user["_id"] = str(user["_id"])
        return jsonify(user), 200
    return jsonify({"error": "User not found"}), 404

# Route to update user details by ID
@app.route('/api/users/<id>', methods=['PUT'])
def update_user(id):
    data = request.json

    # Remove the `_id` field from the data if it exists
    if '_id' in data:
        del data['_id']

    try:
        result = db.users.update_one({"_id": ObjectId(id)}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


    
import random

# List of fitness tips or motivational quotes
TIPS_AND_QUOTES = [
    "Level Up Your Fitness: Consistency is the only stat that truly matters.",
    "Become the Hunter: Hunt down your fitness goals with relentless determination.",
    "Embrace Imperfection: Even the lowest of efforts is a step in the right direction.",
    "Every Rep is a Quest: Even a short workout strengthens your resolve." ,
    "Fuel Your Ascension: Nourishment is the foundation of your power.",
    "Ignore the Rankings: Focus on your own journey, not others.",
    "Rest and Recover: Recharge your mana for the next challenge.",
    "Breakthrough Your Limits: Every workout is an opportunity to surpass your previous self.",
    "Master Your Domain: Conquer your body and mind, just as you would a dungeon.",
    "Evolve or Perish: Continuously adapt and improve to reach your peak performance."
]

# Route to fetch a random tip or motivational quote
@app.route('/api/tip', methods=['GET'])
def get_tip():
    tip = random.choice(TIPS_AND_QUOTES)
    return jsonify({"tip": tip})



if __name__ == "__main__":
    app.run(debug=True)
