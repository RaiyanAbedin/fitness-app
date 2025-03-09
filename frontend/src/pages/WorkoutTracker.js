import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="min-h-screen bg-blue-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back to Dashboard Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Back to Dashboard
                </button>

                <h1 className="text-3xl font-bold mb-6">Workout Tracker</h1>
                
                {/* New Workout Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 mb-6 shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Log New Workout</h2>
                    
                    {/* Plan indicator */}
                    {isUsingPlan && (
                        <div className="mb-4 bg-purple-100 p-4 rounded-lg border border-purple-300">
                            <h3 className="text-purple-800 font-semibold">
                                Following Plan: {newWorkout.planName}
                            </h3>
                            <p className="text-sm text-purple-700">
                                Fill in the weights and reps for your workout
                            </p>
                        </div>
                    )}
                    
                    {newWorkout.exercises.map((exercise, exerciseIndex) => (
                        <div key={exerciseIndex} className="mb-4 p-4 border rounded">
                            <input
                                type="text"
                                placeholder="Exercise Name"
                                value={exercise.name}
                                onChange={(e) => handleExerciseChange(exerciseIndex, 'name', e.target.value)}
                                className="mb-2 p-2 border rounded w-full"
                                readOnly={isUsingPlan} // Make field readonly if using a plan
                            />
                            
                            {exercise.sets.map((set, setIndex) => (
                                <div key={setIndex} className="flex gap-2 mb-2">
                                    <input
                                        type="number"
                                        placeholder="Weight (kg)"
                                        value={set.weight}
                                        onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', e.target.value)}
                                        className="p-2 border rounded w-1/2"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Reps"
                                        value={set.reps}
                                        onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', e.target.value)}
                                        className="p-2 border rounded w-1/2"
                                    />
                                </div>
                            ))}
                            
                            <button
                                type="button"
                                onClick={() => addSet(exerciseIndex)}
                                className="mt-2 px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Add Set
                            </button>
                        </div>
                    ))}
                    
                    {/* Only show the "Add Exercise" button if not using a plan */}
                    {!isUsingPlan && (
                        <button
                            type="button"
                            onClick={addExercise}
                            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Add Exercise
                        </button>
                    )}
                    
                    <div className="mb-4">
                        <input
                            type="number"
                            placeholder="Duration (minutes)"
                            value={newWorkout.duration}
                            onChange={(e) => setNewWorkout({...newWorkout, duration: e.target.value})}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    
                    <div className="mb-4">
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
                    
                    <div className="mb-4">
                        <textarea
                            placeholder="Workout Notes"
                            value={newWorkout.notes}
                            onChange={(e) => setNewWorkout({...newWorkout, notes: e.target.value})}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Log Workout
                    </button>
                </form>
                
                {/* Workout History */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Workout History</h2>
                    {workouts.length > 0 ? (
                        workouts.map((workout, index) => (
                            <div key={index} className="mb-4 p-4 border rounded">
                                <div className="font-semibold">Date: {workout.date}</div>
                                
                                {/* Show plan name if workout used a plan */}
                                {workout.plan_used && (
                                    <div className="mt-1 text-purple-600 font-medium">
                                        Followed Plan: {workout.plan_used}
                                    </div>
                                )}
                                
                                {workout.exercises.map((exercise, exerciseIndex) => (
                                    <div key={exerciseIndex} className="ml-4 mt-2">
                                        <div className="font-medium">{exercise.name}</div>
                                        {exercise.sets.map((set, setIndex) => (
                                            <div key={setIndex} className="ml-4">
                                                Set {setIndex + 1}: {set.weight}kg x {set.reps} reps
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                
                                <div className="mt-2 text-gray-600">
                                    Duration: {workout.duration} minutes | Mood: {workout.mood}
                                </div>
                                {workout.notes && (
                                    <div className="mt-2 text-gray-600">Notes: {workout.notes}</div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No workout history found. Start tracking today!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkoutTracker;