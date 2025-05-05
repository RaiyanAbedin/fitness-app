import openai
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def analyze_logged_workouts(workout_logs):
    """
    Analyze user workout logs using OpenAI
    """
    if not workout_logs or len(workout_logs) < 3:
        return {"message": "Need at least 3 logged workouts for meaningful analysis."}
    
    # Prepare the data for analysis in a compact format
    analysis_data = []
    for log in workout_logs:
        # Extract only the needed fields
        log_data = {
            "date": log.get("date"),
            "exercises": [f"{e.get('name')} - {e.get('sets')}x{e.get('reps')}" for e in log.get("exercises", [])],
            "duration": log.get("duration"),
            "mood": log.get("mood"),
            "notes": log.get("notes", "")[:50]  # shorten long notes
        }
        analysis_data.append(log_data)
    
    # Prompt for OpenAI
    prompt = f"""
    Analyze these workout logs and provide insights in JSON format:
    
    {json.dumps(analysis_data[:20], indent=2)}  # Limit to 20 most recent workouts
    
    Provide analysis in this JSON structure:
    {{
        "consistency": "Analysis of workout frequency and regularity",
        "progress": "Patterns in exercise progression",
        "focus_areas": ["Primary muscle groups being targeted"],
        "strength_areas": ["Areas showing good progress"],
        "improvement_areas": ["Suggested areas to focus on"],
        "mood_patterns": "How mood correlates with workout performance",
        "recommendations": ["3-5 actionable suggestions"]
    }}
    """
    
    # Call OpenAI
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-16k",
            messages=[
                {"role": "system", "content": "You are a fitness analytics AI that provides data-driven insights from workout logs."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.5
        )
        
        analysis = response['choices'][0]['message']['content'].strip()
        
        # Ensure it's valid JSON
        try:
            analysis_json = json.loads(analysis)
            return analysis_json
        except json.JSONDecodeError:
            # If not valid JSON, return as text
            return {"text_analysis": analysis}
            
    except Exception as e:
        print(f"Error in OpenAI analysis: {str(e)}")
        return {"error": "Failed to analyze workout data."}


