import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WorkoutDisplay from './WorkoutDisplay';
import { useNavigate } from 'react-router-dom';

import { 
    ArrowLeft,
} from 'lucide-react';

const GenerateWorkout = () => {
    const [goal, setGoal] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [timeAvailable, setTimeAvailable] = useState('');
    const [workout, setWorkout] = useState('');
    const [savedWorkouts, setSavedWorkouts] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setError('User not logged in.');
                setIsLoading(false);
                return;
            }
    
            const response = await axios.post('http://127.0.0.1:5000/api/generate-workout', {
                user_id: userId,
                goal,
                experience_level: experienceLevel,
                time_available: timeAvailable
            });
    
            setWorkout(response.data.workout);
            await fetchSavedWorkouts();
        } catch (err) {
            console.error('Error generating workout:', err);
            setError('Failed to generate workout. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSavedWorkouts = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setError('User not logged in.');
                return;
            }

            const response = await axios.get(`http://127.0.0.1:5000/api/workout-history/${userId}`);
            
            if (response.data.workout_logs) {
                setSavedWorkouts(response.data.workout_logs);
            } else {
                setSavedWorkouts([]);
            }
        } catch (err) {
            console.error('Error fetching workouts:', err);
            setError('Failed to fetch saved workouts.');
        }
    };

    useEffect(() => {
        fetchSavedWorkouts();
    }, []);

    // ✅ FIX: Define saveWorkout function
    const saveWorkout = async (exercise) => {
        try {
            const userId = localStorage.getItem("user_id");
            if (!userId) {
                setError("User not logged in.");
                return;
            }

            console.log("Saving exercise to API:", exercise); // Debugging log

            const response = await axios.post("http://127.0.0.1:5000/api/save-exercise", {
                user_id: userId,
                exercise_name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps
            });


            if (response.status === 201) {
                alert("Workout saved successfully!");
                fetchSavedWorkouts(); // Refresh saved workouts
            }
        } catch (err) {
            console.error("Error saving workout:", err);
            setError("Failed to save workout.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">

            <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                

                {/* Workout Generator Form */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h1 className="text-2xl font-bold mb-4">Generate AI Workout</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-medium mb-2">Fitness Goal</label>
                            <input
                                type="text"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="E.g., Build muscle, Lose weight, Improve endurance"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-2">Experience Level</label>
                            <select
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Experience Level</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-2">Time Available (minutes)</label>
                            <input
                                type="number"
                                value={timeAvailable}
                                onChange={(e) => setTimeAvailable(e.target.value)}
                                placeholder="E.g., 30"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                min="1"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Generating...' : 'Generate Workout'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                </div>

                {/* Generated Workout Display */}
                {workout && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold mb-4">Your Generated Workout Plan</h2>
                        <WorkoutDisplay workoutData={workout} saveWorkout={saveWorkout} />
                    </div>
                )}

                {/* Saved Workouts Display */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Workout History</h2>
                    {savedWorkouts.length > 0 ? (
                        <div className="space-y-4">
                            {savedWorkouts.map((log, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded border">
                                    <div className="flex flex-wrap justify-between mb-3">
                                        <span className="font-medium text-gray-800">
                                            {new Date(log.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <WorkoutDisplay workoutData={log.workout_details} saveWorkout={saveWorkout} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            No workout history yet. Generate your first workout to get started!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateWorkout;
