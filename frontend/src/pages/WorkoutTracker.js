import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Plus, Trash, Edit, Dumbbell, UserCircle, Clipboard, Save } from 'lucide-react';

const WorkoutTracker = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const planFromPlanner = location.state?.plan;
    const [isUsingPlan, setIsUsingPlan] = useState(false);
    
    const [workouts, setWorkouts] = useState([]);
    const [newWorkout, setNewWorkout] = useState({
        exercises: [{ name: '', sets: [{ weight: '', reps: '' }] }],
        duration: '',
        mood: '',
        notes: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWorkouts();
        
        // If we have a plan from the planner, use it to pre-fill the form
        if (planFromPlanner) {
            setIsUsingPlan(true);
            
            // Format the exercises from the plan to match our tracker's format
            const formattedExercises = planFromPlanner.exercises.map(ex => ({
                name: ex.exercise_name,
                sets: Array(parseInt(ex.sets)).fill().map(() => ({ 
                    weight: '', 
                    reps: ex.reps.toString() 
                }))
            }));
            
            setNewWorkout(prev => ({
                ...prev,
                exercises: formattedExercises,
                planName: planFromPlanner.plan_name
            }));
        }
    }, []);

    const fetchWorkouts = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            const response = await axios.get(`http://127.0.0.1:5000/api/workout-logs/${userId}`);
            setWorkouts(response.data.workout_logs);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch workouts');
            setLoading(false);
        }
    };

    const addExercise = () => {
        setNewWorkout(prev => ({
            ...prev,
            exercises: [...prev.exercises, { name: '', sets: [{ weight: '', reps: '' }] }]
        }));
    };

    const addSet = (exerciseIndex) => {
        const updatedWorkout = { ...newWorkout };
        updatedWorkout.exercises[exerciseIndex].sets.push({ weight: '', reps: '' });
        setNewWorkout(updatedWorkout);
    };

    const handleExerciseChange = (exerciseIndex, field, value) => {
        const updatedWorkout = { ...newWorkout };
        updatedWorkout.exercises[exerciseIndex][field] = value;
        setNewWorkout(updatedWorkout);
    };

    const handleSetChange = (exerciseIndex, setIndex, field, value) => {
        const updatedWorkout = { ...newWorkout };
        updatedWorkout.exercises[exerciseIndex].sets[setIndex][field] = value;
        setNewWorkout(updatedWorkout);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userId = localStorage.getItem('user_id');
            const workoutData = {
                ...newWorkout,
                user_id: userId,
                plan_used: isUsingPlan ? newWorkout.planName : null
            };
            
            await axios.post('http://127.0.0.1:5000/api/workout-logs', workoutData);
            fetchWorkouts();
            
            // Reset the form
            setNewWorkout({
                exercises: [{ name: '', sets: [{ weight: '', reps: '' }] }],
                duration: '',
                mood: '',
                notes: ''
            });
            setIsUsingPlan(false);
        } catch (err) {
            setError('Failed to log workout');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
                <div className="text-[#0ff] text-xl animate-pulse">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back to Dashboard Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800/70 text-white rounded backdrop-blur-sm border border-gray-700 hover:border-[#0ff]/50"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    <Dumbbell className="w-6 h-6 text-[#0ff]" />
                    Workout Tracker
                </h1>
                
                {/* New Workout Form */}
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                        <Plus className="w-5 h-5 text-[#0ff]" />
                        Log New Workout
                    </h2>
                    
                    {/* Plan indicator */}
                    {isUsingPlan && (
                        <div className="mb-4 bg-purple-900/50 p-4 rounded-lg border border-purple-500/50">
                            <h3 className="text-purple-300 font-semibold flex items-center gap-2">
                                <Clipboard className="w-4 h-4" />
                                Following Plan: {newWorkout.planName}
                            </h3>
                            <p className="text-sm text-purple-200 mt-1">
                                Fill in the weights and reps for your workout
                            </p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {newWorkout.exercises.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex} className="p-4 rounded-lg bg-gray-700/50 border border-gray-600">
                                <input
                                    type="text"
                                    placeholder="Exercise Name"
                                    value={exercise.name}
                                    onChange={(e) => handleExerciseChange(exerciseIndex, 'name', e.target.value)}
                                    className="mb-3 p-2 bg-gray-800/70 border border-gray-600 rounded w-full text-white focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                    readOnly={isUsingPlan}
                                />
                                
                                <div className="space-y-2">
                                    {exercise.sets.map((set, setIndex) => (
                                        <div key={setIndex} className="flex gap-2">
                                            <div className="w-8 flex items-center justify-center text-gray-400 font-semibold">
                                                {setIndex + 1}
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="Weight (kg)"
                                                value={set.weight}
                                                onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', e.target.value)}
                                                className="p-2 bg-gray-800/70 border border-gray-600 rounded flex-1 text-white focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Reps"
                                                value={set.reps}
                                                onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', e.target.value)}
                                                className="p-2 bg-gray-800/70 border border-gray-600 rounded flex-1 text-white focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                            />
                                        </div>
                                    ))}
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={() => addSet(exerciseIndex)}
                                    className="mt-3 px-4 py-1 bg-gray-600/70 text-gray-300 rounded hover:bg-gray-600 hover:border-[#0ff]/30 flex items-center gap-1 text-sm border border-gray-600"
                                >
                                    <Plus className="w-4 h-4" /> Add Set
                                </button>
                            </div>
                        ))}
                        
                        {/* Only show the "Add Exercise" button if not using a plan */}
                        {!isUsingPlan && (
                            <button
                                type="button"
                                onClick={addExercise}
                                className="w-full px-4 py-2 bg-gray-700/70 border border-gray-600 hover:border-[#0ff]/50 text-white rounded backdrop-blur-sm hover:bg-gray-700 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4 text-[#0ff]" /> Add Exercise
                            </button>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-[#0ff]" /> Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Duration"
                                    value={newWorkout.duration}
                                    onChange={(e) => setNewWorkout({...newWorkout, duration: e.target.value})}
                                    className="p-2 bg-gray-800/70 border border-gray-600 rounded w-full text-white focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                                    <UserCircle className="w-4 h-4 text-[#0ff]" /> Mood
                                </label>
                                <select
                                    value={newWorkout.mood}
                                    onChange={(e) => setNewWorkout({...newWorkout, mood: e.target.value})}
                                    className="p-2 bg-gray-800/70 border border-gray-600 rounded w-full text-white focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                >
                                    <option value="">Select Mood</option>
                                    <option value="Energetic">Energetic</option>
                                    <option value="Good">Good</option>
                                    <option value="Tired">Tired</option>
                                    <option value="Exhausted">Exhausted</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Workout Notes
                            </label>
                            <textarea
                                placeholder="How did it go? Any achievements or challenges?"
                                value={newWorkout.notes}
                                onChange={(e) => setNewWorkout({...newWorkout, notes: e.target.value})}
                                className="p-2 bg-gray-800/70 border border-gray-600 rounded w-full h-24 resize-none text-white focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                            />
                        </div>
                        
                        {error && <div className="text-red-400">{error}</div>}
                        
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#0ff] to-[#f0f] text-black font-bold px-6 py-3 rounded hover:opacity-90 flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" /> Log Workout
                        </button>
                    </form>
                </div>
                
                {/* Workout History */}
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                        <Calendar className="w-5 h-5 text-[#0ff]" />
                        Workout History
                    </h2>
                    
                    {workouts.length > 0 ? (
                        <div className="space-y-6">
                            {workouts.map((workout, index) => (
                                <div key={index} className="p-4 rounded-lg bg-gray-700/50 border border-gray-600">
                                    <div className="font-semibold text-lg text-[#0ff]">
                                        {new Date(workout.date).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    
                                    {/* Show plan name if workout used a plan */}
                                    {workout.plan_used && (
                                        <div className="mt-1 text-[#f0f] font-medium flex items-center gap-1">
                                            <Clipboard className="w-4 h-4" />
                                            Plan: {workout.plan_used}
                                        </div>
                                    )}
                                    
                                    <div className="mt-3 space-y-3">
                                        {workout.exercises.map((exercise, exerciseIndex) => (
                                            <div key={exerciseIndex} className="bg-gray-600/50 p-3 border border-gray-500 rounded">
                                                <div className="font-medium text-white">{exercise.name}</div>
                                                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {exercise.sets.map((set, setIndex) => (
                                                        <div key={setIndex} className="text-sm bg-gray-700/70 p-2 rounded text-gray-300 border border-gray-600">
                                                            Set {setIndex + 1}: {set.weight || '-'}kg × {set.reps || '-'} reps
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-300">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-[#0ff]" />
                                            Duration: {workout.duration} minutes
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <UserCircle className="w-4 h-4 text-[#0ff]" />
                                            Mood: {workout.mood || 'Not specified'}
                                        </div>
                                    </div>
                                    
                                    {workout.notes && (
                                        <div className="mt-2 bg-gray-700/70 p-3 rounded-lg border border-gray-600">
                                            <div className="text-sm text-gray-300">{workout.notes}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            No workout history found. Start tracking today!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkoutTracker;