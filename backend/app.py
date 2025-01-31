from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash

from flask_cors import CORS

from generate_workout import generate_workout  # Import your OpenAI function

import openai


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



@app.route('/api/workouts/<goal>', methods=['GET'])
def get_workouts_by_goal(goal):
    print(f"Received goal: {goal}")  # Add this for debugging
    # Find workouts that match the goal
    workouts = list(db.workouts.find({"goal": goal}, {"_id": 0}))  # Exclude the MongoDB ID
    if workouts:
        return jsonify({"workouts": workouts}), 200 #this line caused the front end to display that "no workouts were available"
        #adding jsonify({"workouts": workouts}) instead of just (workouts) was causing the data to be fetched correctly as debugged in console.log, but it was not recognising the workouts array.
    else:
        return jsonify({"error": "No workouts found for this goal"}), 404



# Fix the indentation of these routes in app.py

@app.route('/api/generate-workout', methods=['POST'])
def api_generate_workout():
    data = request.json
    user_id = data.get('user_id')
    goal = data.get('goal')
    experience_level = data.get('experience_level')
    time_available = data.get('time_available')

    # Call OpenAI's workout generator
    workout = generate_workout(goal, experience_level, time_available)

    if isinstance(workout, dict) and 'error' in workout:
        return jsonify({"error": workout["error"]}), 400

    # Save the workout to workout_history collection
    workout_entry = {
        "user_id": user_id,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "workout_details": workout,
        "goal": goal,
        "experience_level": experience_level,
        "time_available": time_available
    }

    try:
        db.workout_history.insert_one(workout_entry)
        return jsonify({
            "message": "Workout generated and saved successfully!", 
            "workout": workout
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/workout-history/<user_id>', methods=['GET'])
def get_workout_history(user_id):
    try:
        # Fetch workout history for the given user
        workout_logs = list(db.workout_history.find(
            {"user_id": user_id}, 
            {"_id": 0}
        ).sort("date", -1))  # Sort by date descending
        
        return jsonify({"workout_logs": workout_logs}), 200
    except Exception as e:
        print(f"Error fetching workout history: {str(e)}")  # Add logging
        return jsonify({"error": str(e)}), 500




# Add the new OpenAI route here
@app.route('/api/openai', methods=['POST'])
def test_openai_api():
    data = request.json
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        response = openai.Completion.create(
            engine="text-davinci-003",  # Use the desired model
            prompt=prompt,
            max_tokens=150,
            temperature=0.7
        )
        return jsonify({"response": response.choices[0].text.strip()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#workout section::::::::::::::::::::::
# Add these new routes to your app.py

from datetime import datetime

# Route to log a workout
@app.route('/api/workout-logs', methods=['POST'])
def log_workout():
    data = request.json
    data['date'] = datetime.now().strftime('%Y-%m-%d')
    
    try:
        result = db.workout_logs.insert_one(data)
        return jsonify({"message": "Workout logged successfully", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to get user's workout history
@app.route('/api/workout-logs/<user_id>', methods=['GET'])
def get_workout_logs(user_id):
    try:
        logs = list(db.workout_logs.find(
            {"user_id": user_id},
            {"_id": 0}  # Exclude MongoDB ID
        ).sort("date", -1))  # Sort by date descending
        return jsonify({"workout_logs": logs}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to get a specific workout log
@app.route('/api/workout-logs/<user_id>/<log_id>', methods=['GET'])
def get_workout_log(user_id, log_id):
    try:
        log = db.workout_logs.find_one(
            {"_id": ObjectId(log_id), "user_id": user_id},
            {"_id": 0}
        )
        if log:
            return jsonify(log), 200
        return jsonify({"error": "Workout log not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to update a workout log
@app.route('/api/workout-logs/<log_id>', methods=['PUT'])
def update_workout_log(log_id):
    try:
        data = request.json
        result = db.workout_logs.update_one(
            {"_id": ObjectId(log_id)},
            {"$set": data}
        )
        if result.modified_count:
            return jsonify({"message": "Workout log updated successfully"}), 200
        return jsonify({"error": "Workout log not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
