import openai
import json
import os
import re
import random
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def clean_json(json_string):
    """Clean a potentially dirty JSON string with control characters"""
    # Replace common control characters
    cleaned = json_string.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
    
    # Handle escape characters properly
    cleaned = cleaned.replace('\\', '\\\\')
    
    # Remove any other control characters
    cleaned = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', cleaned)
    
    # Sometimes the API returns extra text before or after the JSON
    # Try to extract just the JSON part
    json_pattern = r'(\{.*\})'
    match = re.search(json_pattern, cleaned)
    if match:
        cleaned = match.group(1)
        
    return cleaned

def generate_meal(meal_type, preferences, meal_request=None, calories=None):
    # Get API key from env
    openai.api_key = os.getenv('OPENAI_API_KEY')
    
    # Create calorie restriction text if provided
    calorie_text = f"around {calories} calories" if calories else "a reasonable calorie count"
    
    # Format preferences text
    preference_text = ""
    if preferences and len(preferences) > 0:
        preference_text = f"The meal must strictly adhere to these dietary preferences: {', '.join(preferences)}."
    
    # Create a unique seed for each request to force variation
    random_seed = int(time.time()) + random.randint(1, 10000)
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system", 
                    "content": """You are a culinary AI that specializes in structured data output.
                    You MUST ALWAYS return ONLY valid JSON with NO control characters.
                    Do not include any text or explanations outside the JSON structure.
                    The JSON must be properly escaped and formatted."""
                },
                {
                    "role": "user",
                    "content": f"""Generate a unique {meal_type} recipe with {calorie_text}.
                    
                    {"SPECIFIC REQUEST: " + meal_request if meal_request else "Create something original and unexpected."}
                    
                    {preference_text}
                    
                    Return VALID JSON ONLY in this exact format:
                    {{
                        "meal_type": "{meal_type}",
                        "calories": {calories if calories else 500},
                        "dietary_preferences": [{', '.join([f'"{pref}"' for pref in preferences]) if preferences else ''}],
                        "dishes": [
                            {{
                                "name": "{"Create a dish name based on " + meal_request if meal_request else "Creative dish name"}",
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
                    
                    WARNING: Your response MUST be valid JSON with NO control characters.
                    Do NOT include a 'meal_request' field in your JSON response.
                    Make sure the dish name is descriptive and based on {meal_request if meal_request else "creative culinary concepts"}.
                    """
                }
            ],
            max_tokens=1000,
            temperature=0.9,
            presence_penalty=0.6,
            frequency_penalty=0.6,
            seed=random_seed
        )
        
        meal_plan = response['choices'][0]['message']['content'].strip()
        
        # Clean the JSON string
        cleaned_json = clean_json(meal_plan)
        print(f"Cleaned JSON: {cleaned_json[:100]}...")  # Print first 100 chars
        
        try:
            meal_data = json.loads(cleaned_json)
            
            # Remove meal_request field if it exists
            if "meal_request" in meal_data:
                del meal_data["meal_request"]
            
            # Ensure the dish has a proper name (not just "Creative 400" or similar)
            if "dishes" in meal_data and len(meal_data["dishes"]) > 0:
                dish_name = meal_data["dishes"][0].get("name", "")
                
                # Check if the name is just "Creative" followed by a number
                if re.match(r'^Creative\s+\d+$', dish_name) or dish_name.isdigit():
                    if meal_request:
                        meal_data["dishes"][0]["name"] = f"{meal_request.title()} Special"
                    else:
                        meal_data["dishes"][0]["name"] = f"Chef's {meal_type} Special"
            
            # Ensure calories match what was requested
            if calories:
                meal_data["calories"] = int(calories)
            
            # Ensure the dish has actual ingredients and instructions
            if "dishes" in meal_data:
                for dish in meal_data["dishes"]:
                    if "ingredients" not in dish or len(dish["ingredients"]) <= 1:
                        dish["ingredients"] = [
                            f"Protein source compatible with {', '.join(preferences)}",
                            "Fresh vegetables",
                            "Herbs and spices",
                            "Healthy fats",
                            "Optional garnishes"
                        ]
                    
                    if "instructions" not in dish or dish["instructions"] == "Preparation instructions would go here":
                        dish["instructions"] = f"Prepare ingredients according to dietary preferences. Cook thoroughly and serve hot."
            
            return json.dumps(meal_data)
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error processing meal JSON: {e}")
            # Create a more detailed fallback meal
            
            # Intelligently create a meal name based on request and preferences
            meal_name = meal_request
            if not meal_name:
                if any(pref.lower() == "vegetarian" or pref.lower() == "vegan" for pref in preferences):
                    meal_name = "Plant-based Bowl"
                elif any(pref.lower() == "gluten-free" for pref in preferences):
                    meal_name = "Gluten-free Plate"
                elif any(pref.lower() == "halal" for pref in preferences):
                    meal_name = "Halal Special"
                else:
                    meal_name = f"{meal_type} Special"
            
            # Intelligently create ingredients based on preferences
            ingredients = []
            if any(pref.lower() == "vegetarian" or pref.lower() == "vegan" for pref in preferences):
                ingredients.extend(["Tofu", "Chickpeas", "Quinoa", "Mixed vegetables"])
                if any(pref.lower() == "vegetarian" for pref in preferences) and not any(pref.lower() == "vegan" for pref in preferences):
                    ingredients.append("Feta cheese")
            elif any(pref.lower() == "halal" for pref in preferences):
                ingredients.extend(["Halal chicken", "Basmati rice", "Mixed vegetables"])
            else:
                ingredients.extend(["Protein of choice", "Whole grains", "Mixed vegetables"])
            
            # Add appropriate instructions
            instructions = "Cook ingredients according to dietary preferences. Season to taste and serve fresh."
            
            fallback_meal = {
                "meal_type": meal_type,
                "calories": int(calories) if calories else 500,
                "dietary_preferences": preferences,
                "dishes": [{
                    "name": meal_name if meal_name else f"{meal_type} Special",
                    "ingredients": ingredients,
                    "instructions": instructions,
                    "protein": 25,
                    "carbs": 35,
                    "fat": 15
                }]
            }
            return json.dumps(fallback_meal)
            
    except Exception as e:
        print(f"Exception in meal generation: {e}")
        # Even more basic fallback
        basic_fallback = {
            "meal_type": meal_type,
            "calories": int(calories) if calories else 500,
            "dietary_preferences": preferences,
            "dishes": [{
                "name": meal_request if meal_request else f"Healthy {meal_type}",
                "ingredients": [
                    f"Ingredients suitable for {', '.join(preferences) if preferences else 'your preferences'}"
                ],
                "instructions": "Prepare according to dietary preferences",
                "protein": 25,
                "carbs": 35,
                "fat": 15
            }]
        }
        return json.dumps(basic_fallback)