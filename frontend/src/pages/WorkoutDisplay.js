import React from 'react';
import { 
  Flame, 
  Clock, 
  Activity, 
  Target, 
  Trophy,
  Dumbbell,
  Heart,
  AlertCircle
} from 'lucide-react';

const WorkoutDisplay = ({ workoutData, saveWorkout, showSaveButton = true }) => {
    console.log("🚀 Received workoutData in WorkoutDisplay:", workoutData);

// Fix for malformed workout data from OpenAI
// Sometimes the API returns markdown-formatted JSON (```json {...} ```)
// or incomplete/truncated responses. This parsing function:
// 1. Removes markdown code block markers
// 2. Attempts to parse the clean JSON
// 3. Falls back to creating a structured object if parsing fails
    const parseWorkoutData = (data) => {
        if (typeof data === 'string') {
            try {
                // First, clean up Markdown code block formatting
                const cleanedData = data
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .trim();
                    
                // Now try to parse the JSON
                return JSON.parse(cleanedData);
            } catch (e) {
                console.error("❌ Failed to parse workoutData:", e);
                
                // If that fails, try to create a structured workout from text
                // [Your existing text parsing code]
            }
        }
        return data;
    };

    const workout = parseWorkoutData(workoutData);

    if (typeof workoutData === 'string') {
        try {
            // Remove any triple backticks if they exist - which was causing json errors and the workoutdisplay css to not show
            workoutData = workoutData.replace(/```json/g, "").replace(/```/g, "");
    
            // Convert JSON string into an object
            workoutData = JSON.parse(workoutData);
        } catch (error) {
            console.error("❌ Failed to parse workoutData:", error);
        }
    }
    

    if (!workout?.exercises) {
        return null;
    }


    
    // Calculate estimated calories (rough estimate)
    const estimatedCalories = Math.round(
        workout.time_available * (
            workout.experience_level === 'Beginner' ? 5 :
            workout.experience_level === 'Intermediate' ? 7 : 9
        )
    );

    // Calculate total volume (sets * reps)
    const totalVolume = workout.exercises.reduce((acc, exercise) => 
        acc + (exercise.sets * exercise.reps), 0
    );

    const getDifficultyColor = (level) => {
        switch(level) {
            case 'Beginner':
                return 'text-green-500';
            case 'Intermediate':
                return 'text-yellow-500';
            case 'Advanced':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Workout Summary Card */}
            <div className="bg-gradient-to-r from-purple-700 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Workout Summary</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        <div>
                            <div className="text-sm opacity-80">Goal</div>
                            <div className="font-semibold">{workout.goal}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        <div>
                            <div className="text-sm opacity-80">Level</div>
                            <div className="font-semibold">{workout.experience_level}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <div>
                            <div className="text-sm opacity-80">Duration</div>
                            <div className="font-semibold">{workout.time_available} min</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5" />
                        <div>
                            <div className="text-sm opacity-80">Est. Calories</div>
                            <div className="font-semibold">{estimatedCalories}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Dumbbell className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold">Exercises</h3>
                </div>
                
                {workout.exercises.map((exercise, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <h4 className="text-lg font-medium text-blue-700">
                                    {index + 1}. {exercise.name}
                                </h4>
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                    {exercise.sets} × {exercise.reps}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span className="text-gray-700">Rest: {exercise.rest || '60-90'} sec</span>
                            </div>
                                
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-yellow-500" />
                                <span className="text-gray-700">Intensity: {exercise.intensity || 'Moderate'}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span className="text-gray-700">Target: {exercise.target || exercise.name.split(' ')[0]}</span>
                            </div>
                            </div>

                            {exercise.notes && (
                                <div className="flex items-start gap-2 mt-2 text-gray-600 bg-gray-50 p-3 rounded">
                                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-sm">{exercise.notes}</p>
                                </div>
                            )}
                            {/* Save to Workout Bank Button */}
                            {showSaveButton && (
                            <button 
                                onClick={() => saveWorkout(exercise)}
                                className="mt-3 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                            >
                                Save to Workout Bank
                            </button>
                        )}

                        </div>
                    </div>
                ))}
            </div>

            {/* Workout Stats */}
            <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-sm text-gray-600">Total Sets</div>
                        <div className="text-xl font-semibold text-blue-700">
                            {workout.exercises.reduce((acc, ex) => acc + ex.sets, 0)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-600">Total Reps</div>
                        <div className="text-xl font-semibold text-blue-700">
                            {totalVolume}
                        </div>
                    </div>
                    <div className="text-center md:col-span-1 col-span-2">
                        <div className="text-sm text-gray-600">Difficulty</div>
                        <div className={`text-xl font-semibold ${getDifficultyColor(workout.experience_level)}`}>
                            {workout.experience_level}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutDisplay;