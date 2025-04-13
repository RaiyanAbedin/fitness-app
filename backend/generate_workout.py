import openai
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

def generate_workout(goal, experience_level, time_available):
    # Get API key from environment variable
    openai.api_key = os.getenv('OPENAI_API_KEY')
#below is not used in final implementation
    system_prompt = """You are Alex, a friendly and supportive personal trainer. 
    Write in a casual, encouraging tone as if talking to a friend.
    Focus on making exercises sound fun and approachable.
    Avoid technical jargon - use simple, everyday language.
    Keep the structure clean but friendly.
    
    Remember:
    - Use everyday language instead of technical terms
    - Make it feel like a friend giving advice
    - Keep exercise descriptions simple
    - Add short, encouraging comments
    - Include basic tips that are easy to understand"""
#this is also not used in final implementation - answers felt too jargon-y
    user_prompt = f"""Create a friendly {time_available}-minute workout plan for someone who wants to {goal}.
    They are at a {experience_level} level.
    
    Include:
    - A warm welcome and quick motivation
    - Simple warm-up activities
    - Main exercises with clear, simple instructions
    - Quick cool-down
    - A friendly closing note
    
    Make it feel achievable and fun!"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages = [
    {"role": "system", "content": "You are a fitness AI assistant that creates structured JSON workouts."},
    {
        "role": "user",
        "content": f"""
        Generate a {time_available}-minute workout plan for a {experience_level} user with the goal of {goal}.
        
        Return the workout plan **strictly** in JSON format with this structure:
        {{
            "goal": "{goal}",
            "experience_level": "{experience_level}",
            "time_available": {time_available},
            "exercises": [
                {{
                    "name": "Exercise Name",
                    "sets": 3,
                    "reps": 12
                }},
                {{
                    "name": "Another Exercise",
                    "sets": 3,
                    "reps": 10
                }}
            ]
        }}
        Do **not** include explanations, just return JSON.
        """
    }
]
,
            max_tokens=600,
            temperature=0.7,
        )
        
        workout_plan = response['choices'][0]['message']['content'].strip()
        if not workout_plan:
            return {"error": "Failed to generate a workout plan. Please try again."}
            
        return workout_plan

    except openai.OpenAIError as e:
        return {"error": str(e)}