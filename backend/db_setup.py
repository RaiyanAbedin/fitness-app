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

    # Create Workouts Collection
    db.workouts.insert_one({
        "workout_id": "w001",
        "name": "Full Body Strength",
        "duration": 45,
        "calories_burned": 350,
        "exercises": [
            {"name": "Squats", "sets": 3, "reps": 12},
            {"name": "Deadlift", "sets": 3, "reps": 10}
        ]
    })
    print("Inserted sample workout into 'workouts' collection.")

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

# Run the setup
if __name__ == "__main__":
    setup_database()


