# populate_exercise_db.py
import json
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["fitness_app"]

# Clear existing exercises
db.exercise_library.delete_many({}) #reason for this is to prevent duplicates, and that the db completely matches the json file

# Load exercises from JSON file
with open('exercises.json', 'r') as file:
    exercises = json.load(file)

# Insert exercises into the database
result = db.exercise_library.insert_many(exercises)
print(f"Added {len(result.inserted_ids)} exercises to the database")