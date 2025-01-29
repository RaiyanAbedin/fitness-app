import openai

def generate_workout(goal, experience_level, time_available):
    openai.api_key = "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"

    messages = [
        {"role": "system", "content": "You are a personal fitness trainer."},
        {
            "role": "user",
            "content": (
                f"Please create a {time_available}-minute workout plan for someone "
                f"with a fitness goal of '{goal}' and an experience level of '{experience_level}'. "
                "Include exercises, reps, and sets."
            ),
        },
    ]

    try:
        # Correct usage for the latest OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=500,
            temperature=0.7,
        )
        return response['choices'][0]['message']['content'].strip()

    except openai.OpenAIError as e:
        return {"error": str(e)}
