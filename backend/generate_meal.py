import openai
import json
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

def generate_meal(meal_type, preferences, meal_request=None, calories=None):
    # Get API key from environment variable
    openai.api_key = os.getenv('OPENAI_API_KEY')
    
    # Create calorie restriction text if provided
    calorie_text = f"around {calories} calories" if calories else "a reasonable calorie count"
    
    # Handle meal request if provided
    request_text = ""
    if meal_request:
        request_text = f"The user has specifically requested: {meal_request}."
    
    # Handle dietary preferences
    preference_text = ""
    if preferences and len(preferences) > 0:
        preference_text = f"The meal must respect these dietary preferences: {', '.join(preferences)}."

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages = [
                {"role": "system", "content": "You are a nutrition AI assistant that creates structured JSON meal plans."},
                {
                    "role": "user",
                    "content": f"""
                    Generate a {meal_type} meal with {calorie_text}. {request_text} {preference_text}
                    
                    Return the meal plan **strictly** in JSON format with this structure:
                    {{
                        "meal_type": "{meal_type}",
                        "meal_request": "{meal_request or ''}",
                        "calories": <estimated calories>,
                        "dietary_preferences": [{', '.join([f'"{pref}"' for pref in preferences]) if preferences else ''}],
                        "dishes": [
                            {{
                                "name": "Dish Name",
                                "ingredients": [
                                    "Ingredient 1", 
                                    "Ingredient 2",
                                    "..."
                                ],
                                "instructions": "Brief preparation instructions",
                                "protein": <grams>,
                                "carbs": <grams>,
                                "fat": <grams>
                            }}
                        ]
                    }}
                    Do **not** include explanations, just return JSON.
                    """
                }
            ],
            max_tokens=800,
            temperature=0.7,
        )
        
        # Rest of the function remains the same
        # ...
        
        meal_plan = response['choices'][0]['message']['content'].strip()
        # Clean up the response - remove markdown code blocks
        meal_plan = meal_plan.replace("```json", "").replace("```", "").strip()
        
        # Validate JSON before returning
        try:
            # This will raise an exception if the meal_plan is not valid JSON
            json.loads(meal_plan)
            return meal_plan
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            # Return structured error response
            return json.dumps({
                "error": "Failed to generate a properly formatted meal plan. Please try again."
            })
            
    except openai.OpenAIError as e:
        return json.dumps({"error": str(e)})