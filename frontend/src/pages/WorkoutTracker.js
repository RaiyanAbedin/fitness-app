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
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-blue-500 text-xl animate-pulse">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back to Dashboard Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    <Dumbbell className="w-6 h-6 text-blue-500" />
                    Workout Tracker
                </h1>
                
                {/* New Workout Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-500" />
                        Log New Workout
                    </h2>
                    
                    {/* Plan indicator */}
                    {isUsingPlan && (
                        <div className="mb-4 bg-purple-100 p-4 rounded-lg border border-purple-300">
                            <h3 className="text-purple-800 font-semibold flex items-center gap-2">
                                <Clipboard className="w-4 h-4" />
                                Following Plan: {newWorkout.planName}
                            </h3>
                            <p className="text-sm text-purple-700 mt-1">
                                Fill in the weights and reps for your workout
                            </p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {newWorkout.exercises.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex} className="p-4 border rounded-lg bg-gray-50">
                                <input
                                    type="text"
                                    placeholder="Exercise Name"
                                    value={exercise.name}
                                    onChange={(e) => handleExerciseChange(exerciseIndex, 'name', e.target.value)}
                                    className="mb-3 p-2 border rounded w-full"
                                    readOnly={isUsingPlan}
                                />
                                
                                <div className="space-y-2">
                                    {exercise.sets.map((set, setIndex) => (
                                        <div key={setIndex} className="flex gap-2">
                                            <div className="w-8 flex items-center justify-center text-gray-500 font-semibold">
                                                {setIndex + 1}
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="Weight (kg)"
                                                value={set.weight}
                                                onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', e.target.value)}
                                                className="p-2 border rounded flex-1"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Reps"
                                                value={set.reps}
                                                onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', e.target.value)}
                                                className="p-2 border rounded flex-1"
                                            />
                                        </div>
                                    ))}
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={() => addSet(exerciseIndex)}
                                    className="mt-3 px-4 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center gap-1 text-sm"
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
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Exercise
                            </button>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-blue-500" /> Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Duration"
                                    value={newWorkout.duration}
                                    onChange={(e) => setNewWorkout({...newWorkout, duration: e.target.value})}
                                    className="p-2 border rounded w-full"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <UserCircle className="w-4 h-4 text-blue-500" /> Mood
                                </label>
                                <select
                                    value={newWorkout.mood}
                                    onChange={(e) => setNewWorkout({...newWorkout, mood: e.target.value})}
                                    className="p-2 border rounded w-full"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Workout Notes
                            </label>
                            <textarea
                                placeholder="How did it go? Any achievements or challenges?"
                                value={newWorkout.notes}
                                onChange={(e) => setNewWorkout({...newWorkout, notes: e.target.value})}
                                className="p-2 border rounded w-full h-24 resize-none"
                            />
                        </div>
                        
                        {error && <div className="text-red-500">{error}</div>}
                        
                        <button
                            type="submit"
                            className="w-full bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" /> Log Workout
                        </button>
                    </form>
                </div>
                
                {/* Workout History */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Workout History
                    </h2>
                    
                    {workouts.length > 0 ? (
                        <div className="space-y-6">
                            {workouts.map((workout, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="font-semibold text-lg text-blue-700">
                                        {new Date(workout.date).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    
                                    {/* Show plan name if workout used a plan */}
                                    {workout.plan_used && (
                                        <div className="mt-1 text-purple-600 font-medium flex items-center gap-1">
                                            <Clipboard className="w-4 h-4" />
                                            Plan: {workout.plan_used}
                                        </div>
                                    )}
                                    
                                    <div className="mt-3 space-y-3">
                                        {workout.exercises.map((exercise, exerciseIndex) => (
                                            <div key={exerciseIndex} className="bg-white p-3 border rounded">
                                                <div className="font-medium text-gray-800">{exercise.name}</div>
                                                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {exercise.sets.map((set, setIndex) => (
                                                        <div key={setIndex} className="text-sm bg-gray-100 p-2 rounded">
                                                            Set {setIndex + 1}: {set.weight || '-'}kg × {set.reps || '-'} reps
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            Duration: {workout.duration} minutes
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <UserCircle className="w-4 h-4 text-blue-500" />
                                            Mood: {workout.mood || 'Not specified'}
                                        </div>
                                    </div>
                                    
                                    {workout.notes && (
                                        <div className="mt-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                            <div className="text-sm text-gray-700">{workout.notes}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No workout history found. Start tracking today!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkoutTracker;