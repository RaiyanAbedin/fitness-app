from pymongo import MongoClient

# MongoDB Connection URI
MONGO_URI = "mongodb://localhost:27017/"

# Connect to MongoDB
client = MongoClient(MONGO_URI)

# Define the database
db = client["fitness_app"]

# Create collections and insert sample data
def setup_database():
    # Create Users Collection
    db.users.insert_one({
        "name": "John Doe",
        "email": "johndoe@example.com",
        "age": 25,
        "height": 180,
        "weight": 75,
        "dietary_preferences": ["halal", "vegan"],
        "goals": "weight loss"
    })
    print("Inserted sample user into 'users' collection.")

    # Insert more detailed sample workouts
    db.workouts.insert_many([
        {
            "workout_id": "w001",
            "goal": "Gain Weight",
            "name": "Full Body Strength",
            "duration": 60,  # in minutes
            "calories_burned": 500,
            "exercises": [
                {"name": "Bench Press", "sets": 4, "reps": 8},
                {"name": "Deadlift", "sets": 3, "reps": 6},
                {"name": "Squats", "sets": 4, "reps": 8}
            ]
        },
        {
            "workout_id": "w002",
            "goal": "Lose Weight",
            "name": "HIIT Cardio",
            "duration": 30,
            "calories_burned": 400,
            "exercises": [
                {"name": "Jumping Jacks", "sets": 3, "reps": 50},
                {"name": "Burpees", "sets": 3, "reps": 15},
                {"name": "Mountain Climbers", "sets": 3, "reps": 40}
            ]
        },
        {
            "workout_id": "w003",
            "goal": "Maintain Body Fat",
            "name": "Core and Cardio",
            "duration": 45,
            "calories_burned": 300,
            "exercises": [
                {"name": "Plank", "sets": 3, "reps": "30 sec"},
                {"name": "Push-ups", "sets": 3, "reps": 12},
                {"name": "Jogging", "sets": 1, "reps": "10 min"}
            ]
        }
    ])
    print("Inserted sample workouts into 'workouts' collection.")


    # Create Meals Collection
    db.meals.insert_one({
        "meal_id": "m001",
        "name": "Grilled Chicken Salad",
        "calories": 350,
        "ingredients": ["Chicken", "Lettuce", "Tomato"],
        "diet_type": "halal",
        "instructions": "Grill the chicken and toss it with the vegetables."
    })
    print("Inserted sample meal into 'meals' collection.")


    # Add this to your existing db_setup.py

def setup_workout_tracking():
    # Create Workout Logs Collection
    db.workout_logs.create_index([("user_id", 1), ("date", -1)])
    
    # Sample workout log
    db.workout_logs.insert_one({
        "user_id": "sample_user_id",
        "date": "2025-01-29",
        "exercises": [
            {
                "name": "Bench Press",
                "sets": [
                    {"set_number": 1, "weight": 135, "reps": 10},
                    {"set_number": 2, "weight": 145, "reps": 8},
                    {"set_number": 3, "weight": 155, "reps": 6}
                ],
                "notes": "Felt strong today"
            },
            {
                "name": "Squats",
                "sets": [
                    {"set_number": 1, "weight": 185, "reps": 8},
                    {"set_number": 2, "weight": 205, "reps": 6}
                ],
                "notes": "Working on form"
            }
        ],
        "duration": 45,  # in minutes
        "mood": "Energetic",
        "notes": "Great workout session"
    })



# Run the setup
if __name__ == "__main__":
    setup_database()


