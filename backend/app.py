from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash

from flask_cors import CORS

from generate_workout import generate_workout  

from generate_meal import generate_meal 

import openai


# Initialize Flask app
app = Flask(__name__)




# Enable CORS for your Flask app - if cors errors come, restart react and flask server
# Fixed CORS error by allowing credentials & headers, which were blocked in the previous config.
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)




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

    # Use pbkdf2 explicitly to hash the password - a cryptographic algorithm that takes a password and makes it harder for brute-forced attacks
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
        return jsonify({"error": "Invalid email or password"}), 401 #the error message is the same for email and password , for security reasons

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

# List of fitness tips or motivational quotes , currently hardcoded but will change depending on nature of app/theme - future plan is to make it personal
TIPS_AND_QUOTES = [
    "Habit Builder: Consistency is your most reliable power-up. Track your progress daily!",
    "Nutrient Power: Fuel your body with the right nutrients, your ultimate energy source for growth.",
    "Embrace Imperfection: Even the lowest of efforts is a step in the right direction.",
    "Fitness Focus: Every workout, no matter how small, contributes to your overall strength stat.",
    "Nutrition Navigator: Learn to read your body's signals and fuel it with what it truly needs.",
    "Track Your Wins: Keep a record of your achievements to stay motivated and see how far you've come.",
    "Hydration Habit: Make drinking water a consistent and non-negotiable part of your daily routine."]

# Route to fetch a random tip or motivational quote
@app.route('/api/tip', methods=['GET'])
def get_tip():
    tip = random.choice(TIPS_AND_QUOTES)
    return jsonify({"tip": tip})


# Route to get workouts by goal
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




#open ai integration for ai coaching advice/workouts

@app.route('/api/generate-workout', methods=['POST'])
def api_generate_workout():
    data = request.json
    user_id = data.get('user_id')
    goal = data.get('goal')
    experience_level = data.get('experience_level')
    time_available = data.get('time_available')
    #parameters to be passed to generate_workout

    workout = generate_workout(goal, experience_level, time_available)

    if isinstance(workout, dict) and 'error' in workout:
        return jsonify({"error": workout["error"]}), 400

    # save the workout to workout_history collection
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




#workout bank - add workouts from the ai coach into a "bank" of workouts
@app.route('/api/save-exercise', methods=['POST'])
def save_exercise():
    """
    Save a selected exercise to the user's workout bank.
    """
    data = request.json
    print("recieved request to save exercise:",data) #an example of this working is: {'user_id': '12345', 'exercise_name': 'Push-ups', 'sets': 3, 'reps': 12}

    user_id = data.get("user_id")
    exercise_name = data.get("exercise_name")
    sets = data.get("sets")
    reps = data.get("reps")

    if not user_id or not exercise_name:
        return jsonify({"error": "Missing required fields"}), 400

    exercise_entry = {
        "user_id": user_id,
        "exercise_name": exercise_name,
        "sets": sets,
        "reps": reps
    }

    try:
        db.workout_bank.insert_one(exercise_entry)
        return jsonify({"message": "Exercise saved successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#next - this will allow users to retrieve those workouts that were added to the bank
@app.route('/api/workout-bank/<user_id>', methods=['GET'])
def get_workout_bank(user_id):
    """
    Retrieve all saved exercises for a user from the workout bank.
    """
    try:
        exercises = list(db.workout_bank.find({"user_id": user_id}, {"_id": 0}))  # Exclude MongoDB ID
        if not exercises:
            return jsonify({"message": "No exercises saved in the workout bank."}), 404
        return jsonify({"exercises": exercises}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#allows users to delete exercises from the bank
@app.route('/api/workout-bank/<exercise_id>', methods=['DELETE'])
def delete_exercise(exercise_id):
    try:
        userId = request.args.get('user_id')
        if not userId:
            return jsonify({"error": "User ID is required"}), 400
            
        result = db.workout_bank.delete_one({"_id": ObjectId(exercise_id), "user_id": userId})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Exercise not found or not authorized to delete"}), 404
            
        return jsonify({"message": "Exercise removed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



#Backend API for saving custom plans -> this is to save plans that will be individual exercises dragged and dropped into the workout planner
@app.route('/api/save-workout-plan', methods=['POST'])
def save_workout_plan():
    data = request.json
    user_id = data.get("user_id")
    plan_name = data.get("plan_name")
    exercises = data.get("exercises")

    if not user_id or not plan_name or not exercises:
        return jsonify({"error": "Missing required fields"}), 400

    plan_entry = {
        "user_id": user_id,
        "plan_name": plan_name,
        "exercises": exercises
    }

    try:
        db.workout_plans.insert_one(plan_entry)
        return jsonify({"message": "Workout plan saved successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#next - this will allow users to retrieve those workouts that were added to the bank
@app.route('/api/workout-plans/<user_id>', methods=['GET'])
def get_workout_plans(user_id):
    try:
        plans = list(db.workout_plans.find({"user_id": user_id}, {"_id": 0}))
        return jsonify({"plans": plans}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to update a workout plan
from bson import ObjectId  # Import ObjectId to properly query MongoDB

@app.route('/api/update-workout-plan', methods=['PUT'])
def update_workout_plan():
    data = request.json
    user_id = data.get("user_id")
    plan_name = data.get("plan_name")
    exercises = data.get("exercises")


    if not user_id or not plan_name or not exercises:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        result = db.workout_plans.update_one(
            {"user_id": user_id, "plan_name": plan_name},  # Don't convert to ObjectId - this caused an error before as front-end was sending it as a string
            {"$set": {"exercises": exercises}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Workout plan not found"}), 404

        return jsonify({"message": "Workout plan updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Route to delete a workout plan
@app.route('/api/delete-workout-plan', methods=['DELETE'])
def delete_workout_plan():
    data = request.json
    user_id = data.get("user_id")
    plan_name = data.get("plan_name")

    if not user_id or not plan_name:
        return jsonify({"error": "Missing user_id or plan_name"}), 400

    try:
        result = db.workout_plans.delete_one({"user_id": user_id, "plan_name": plan_name})

        if result.deleted_count == 0:
            return jsonify({"error": "Workout plan not found"}), 404

        return jsonify({"message": "Workout plan deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#endpoint for exercise library
@app.route('/api/exercise-library', methods=['GET'])
def get_exercise_library():
    category = request.args.get('category', None)
    try:
        # Apply category filter if provided
        filter_query = {"category": category} if category else {}
        exercises = list(db.exercise_library.find(filter_query, {"_id": 0}))
        return jsonify({"exercises": exercises}), 200
    except Exception as e:
        print(f"Error fetching exercise library: {str(e)}")
        return jsonify({"error": str(e)}), 500


#Nutrition Section: 
@app.route('/api/generate-meal', methods=['POST'])
def api_generate_meal():
    data = request.json
    user_id = data.get('user_id')
    meal_type = data.get('meal_type')
    calories = data.get('calories')
    meal_request = data.get('meal_request')
    
    # Get the user's dietary preferences
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"dietary_preferences": 1})
    preferences = user.get("dietary_preferences", []) if user else []
    

    meal = generate_meal(meal_type, preferences, meal_request, calories) 

     # Debugging statements for now
    print(f"Meal request: {meal_request}")
    print(f"Preferences: {preferences}")
    print(f"Generated meal (preview): {meal[:100]}...") 
    
    if isinstance(meal, dict) and 'error' in meal:
        return jsonify({"error": meal["error"]}), 400
    
    # Save the meal to meal_history collection
    meal_entry = {
        "user_id": user_id,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "meal_details": meal,
        "meal_type": meal_type,
        "calories": calories
    }
    
    try:
        db.meal_history.insert_one(meal_entry)
        return jsonify({
            "message": "Meal generated and saved successfully!", 
            "meal": meal
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/meal-history/<user_id>', methods=['GET'])
def get_meal_history(user_id):
    try:
        # Fetch meal history for the given user
        meal_logs = list(db.meal_history.find(
            {"user_id": user_id}, 
            {"_id": 0} # Exclude MongoDB ID, this may cause issues with the front-end and updating/delete - when i add that function in as this is a unique mongodb id that is assigned to each document, thus the front-end couldnt tell my backend which specific meal i could update or delete , when i do it?
        ).sort("date", -1))  # Sort by date descending
        
        return jsonify({"meal_logs": meal_logs}), 200
    except Exception as e:
        print(f"Error fetching meal history: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/save-recipe', methods=['POST'])
def save_recipe():
    """
    Save a selected recipe to the user's recipe collection.
    """
    data = request.json
    
    user_id = data.get("user_id")
    recipe_name = data.get("recipe_name")
    ingredients = data.get("ingredients")
    instructions = data.get("instructions")
    nutrition = data.get("nutrition", {})
    
    if not user_id or not recipe_name:
        return jsonify({"error": "Missing required fields"}), 400
    
    recipe_entry = {
        "user_id": user_id,
        "recipe_name": recipe_name,
        "ingredients": ingredients,
        "instructions": instructions,
        "nutrition": nutrition,
        "date_saved": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    try:
        db.saved_recipes.insert_one(recipe_entry)
        return jsonify({"message": "Recipe saved successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/saved-recipes/<user_id>', methods=['GET'])
def get_saved_recipes(user_id):
    """
    Retrieve all saved recipes for a user.
    """
    try:
        recipes = list(db.saved_recipes.find({"user_id": user_id}, {"_id": 0}))
        return jsonify({"recipes": recipes}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500




#Shopping List Section - Connects to the Nutrition
# Shopping List Routes
@app.route('/api/shopping-list/<user_id>', methods=['GET'])
def get_shopping_list(user_id):
    try:
        shopping_list = list(db.shopping_list.find({"user_id": user_id})) #when querying the mongodb , makes sure url userid matches with the one in the db
        # Convert ObjectId to string for each item
        for item in shopping_list:
            item['_id'] = str(item['_id']) #was having issues with update/delete. this is because mongo db assign a unique id to each document in the db - this example, the shopping list. so that you can specifically target it (delete/update etc) ensures you can find unique docs even if you have multiple items. e.g - apple and apple #2 
            #original api route was filtering out these document id's : we removed: {"_id": 0}, as my front-end couldnt tell my backend which specific ingredient i could update or delete.
        return jsonify({"shopping_list": shopping_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add an item to the shopping list
@app.route('/api/shopping-list', methods=['POST'])
def add_shopping_item():
    """Add an item to the shopping list"""
    data = request.json
    user_id = data.get('user_id')
    item_name = data.get('item_name')
    category = data.get('category', 'Other')  # Default category
    quantity = data.get('quantity', '1')      # Default quantity
    
    if not user_id or not item_name:
        return jsonify({"error": "User ID and item name are required"}), 400
        
    item = {
        "user_id": user_id,
        "item_name": item_name,
        "category": category,
        "quantity": quantity,
        "purchased": False,
        "date_added": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    try:
        result = db.shopping_list.insert_one(item)
        return jsonify({
            "message": "Item added to shopping list",
            "item_id": str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/shopping-list/<item_id>', methods=['PUT']) #update shopping list
def update_shopping_item(item_id):
    """Update a shopping list item (e.g., mark as purchased)"""
    data = request.json
    
    try:
        result = db.shopping_list.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": data}
        )
        if result.modified_count:
            return jsonify({"message": "Item updated successfully"}), 200
        return jsonify({"error": "Item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/shopping-list/<item_id>', methods=['DELETE']) #delete shopping list
def delete_shopping_item(item_id):
    """Delete an item from the shopping list"""
    try:
        result = db.shopping_list.delete_one({"_id": ObjectId(item_id)})
        if result.deleted_count:
            return jsonify({"message": "Item deleted successfully"}), 200
        return jsonify({"error": "Item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/shopping-list/from-recipe', methods=['POST']) #add recipe to shopping list
def add_recipe_to_shopping_list():
    """Add all ingredients from a recipe to the shopping list"""
    data = request.json
    user_id = data.get('user_id')
    ingredients = data.get('ingredients', [])
    
    if not user_id or not ingredients:
        return jsonify({"error": "User ID and ingredients are required"}), 400
    
    items = []
    for ingredient in ingredients:
        # Simple parsing to extract quantity and category
        # This is a basic implementation - could be enhanced with NLP
        parts = ingredient.split()
        quantity = "1"
        
        # Try to extract a numeric quantity
        if parts and parts[0].replace('.', '', 1).isdigit():
            quantity = parts[0]
            ingredient = ' '.join(parts[1:])
            
        # Simplistic category determination - could be improved
        category = "Other"
        if any(keyword in ingredient.lower() for keyword in ["fruit", "apple", "banana", "berry"]):
            category = "Fruits"
        elif any(keyword in ingredient.lower() for keyword in ["vegetable", "carrot", "broccoli", "onion"]):
            category = "Vegetables"
        elif any(keyword in ingredient.lower() for keyword in ["meat", "chicken", "beef", "pork"]):
            category = "Meat"
        elif any(keyword in ingredient.lower() for keyword in ["milk", "cheese", "yogurt"]):
            category = "Dairy"
        elif any(keyword in ingredient.lower() for keyword in ["flour", "rice", "pasta", "bread"]):
            category = "Grains"
            
        items.append({
            "user_id": user_id,
            "item_name": ingredient,
            "category": category,
            "quantity": quantity,
            "purchased": False,
            "date_added": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
    
    try:
        if items:
            db.shopping_list.insert_many(items)
            return jsonify({"message": f"Added {len(items)} ingredients to shopping list"}), 201
        return jsonify({"message": "No items to add"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Import the analysis function
from workout_analytics import analyze_logged_workouts
@app.route('/api/workout-insights/<user_id>', methods=['GET'])
def get_workout_insights(user_id):
    # Check if we should generate new insights
    generate_new = request.args.get('generate', 'false').lower() == 'true'
    
    try:
        if not generate_new:
            # Try to fetch the most recent saved insights first
            saved_insights = db.workout_insights.find_one(
                {"user_id": user_id},
                sort=[("generation_date", -1)]
            )
            
            if saved_insights:
                # Convert ObjectId to string for JSON serialization
                if "_id" in saved_insights:
                    saved_insights["_id"] = str(saved_insights["_id"])
                
                return jsonify({
                    "insights": saved_insights["insights"],
                    "generated_on": saved_insights["generation_date"],
                    "is_new": False
                }), 200
        
        # Either we need to generate new insights or there are no saved insights
        workout_logs = list(db.workout_logs.find(
            {"user_id": user_id}
        ).sort("date", -1))
        
        if not workout_logs or len(workout_logs) < 3:
            return jsonify({
                "message": "Need at least 3 logged workouts for meaningful analysis."
            }), 200
        
        # Generate new insights using the imported function
        new_insights = analyze_logged_workouts(workout_logs)
        
        # Save the new insights
        generation_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Save to database
        insights_entry = {
            "user_id": user_id,
            "insights": new_insights,
            "generation_date": generation_date
        }
        
        db.workout_insights.insert_one(insights_entry)
        
        return jsonify({
            "insights": new_insights,
            "generated_on": generation_date,
            "is_new": True
        }), 200
        
    except Exception as e:
        print(f"Error with workout insights: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
