import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WorkoutDisplay from './WorkoutDisplay';
import { useNavigate } from 'react-router-dom';

import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUp, AlertTriangle } from 'lucide-react';

import { 
    ArrowLeft,
    Target,
    Activity,
    Clock,
    Plus
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

    const saveWorkout = async (exercise) => {
        try {
            const userId = localStorage.getItem("user_id");
            if (!userId) {
                setError("User not logged in.");
                return;
            }

            console.log("Saving exercise to API:", exercise);

            const response = await axios.post("http://127.0.0.1:5000/api/save-exercise", {
                user_id: userId,
                exercise_name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps
            });

            if (response.status === 201) {
                alert("Workout saved successfully!");
                fetchSavedWorkouts();
            }
        } catch (err) {
            console.error("Error saving workout:", err);
            setError("Failed to save workout.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800/70 text-white rounded backdrop-blur-sm border border-gray-700 hover:border-[#0ff]/50"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                {/* Workout Generator Form */}
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-gray-700">
                    <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-[#0ff]" />
                        Let's Build Your Workout
                    </h1>

                    {/* Health & Safety Disclosure */}
    <Disclosure as="div" className="mb-6">
        {({ open }) => (
            <>
                <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-700/50 px-4 py-2 text-left text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring focus-visible:ring-[#0ff] focus-visible:ring-opacity-75 border border-gray-600">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-[#f0f]" />
                        <span>Important Health & Safety Information</span>
                    </div>
                    <ChevronUp
                        className={`${
                            open ? 'rotate-180 transform' : ''
                        } h-5 w-5 text-[#0ff]`}
                    />
                </Disclosure.Button>
                <Transition
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                >
                    <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-300 bg-gray-700/30 rounded-b-lg border-x border-b border-gray-600">
                        <p className="mb-2">
                            <strong className="text-[#0ff]">Medical Disclaimer:</strong> NuroFit is designed for general fitness purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                        </p>
                        <p className="mb-2">
                            Always consult with a qualified healthcare professional before following any exercise program, especially if you have any medical conditions, injuries, or health concerns.
                        </p>
                        <p>
                            By using NuroFit's workout generation features, you acknowledge that you are exercising at your own risk and discretion. Stop any activity immediately if you experience pain, dizziness, or discomfort.
                        </p>
                    </Disclosure.Panel>
                </Transition>
            </>
        )}
    </Disclosure>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Fitness Goal</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Target className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    placeholder="E.g., Build muscle, Lose weight, Improve endurance"
                                    className="pl-10 w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Experience Level</label>
                            <select
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                                className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                required
                            >
                                <option value="">Select Experience Level</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300 flex items-center gap-1">
                                <Clock className="w-4 h-4 text-[#0ff]" /> Time Available (minutes)
                            </label>
                            <input
                                type="number"
                                value={timeAvailable}
                                onChange={(e) => setTimeAvailable(e.target.value)}
                                placeholder="E.g., 30"
                                className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                required
                                min="1"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#0ff] to-[#f0f] text-black font-bold px-6 py-3 rounded hover:opacity-90 flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" /> Generate Workout
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded">
                            {error}
                        </div>
                    )}
                </div>

                {/* Generated Workout Display */}
                {workout && (
                    <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-white">Your Generated Workout Plan</h2>
                        <WorkoutDisplay workoutData={workout} saveWorkout={saveWorkout} />
                    </div>
                )}

                {/* Saved Workouts Display */}
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-white">Workout History</h2>
                    {savedWorkouts.length > 0 ? (
                        <div className="space-y-4">
                            {savedWorkouts.map((log, index) => (
                                <div key={index} className="bg-gray-700/50 p-4 rounded border border-gray-600">
                                    <div className="flex flex-wrap justify-between mb-3">
                                        <span className="font-medium text-[#0ff]">
                                            {new Date(log.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <WorkoutDisplay workoutData={log.workout_details} saveWorkout={saveWorkout} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-4">
                            No workout history yet. Generate your first workout to get started!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateWorkout;