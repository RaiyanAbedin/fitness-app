import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WorkoutTracker = () => {
    const [workouts, setWorkouts] = useState([]);
    const [newWorkout, setNewWorkout] = useState({
        exercises: [{ name: '', sets: [{ weight: '', reps: '' }] }],
        duration: '',
        mood: '',
        notes: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorkouts();
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
                user_id: userId
            };
            
            await axios.post('http://127.0.0.1:5000/api/workout-logs', workoutData);
            fetchWorkouts();
            setNewWorkout({
                exercises: [{ name: '', sets: [{ weight: '', reps: '' }] }],
                duration: '',
                mood: '',
                notes: ''
            });
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
                    
                    {newWorkout.exercises.map((exercise, exerciseIndex) => (
                        <div key={exerciseIndex} className="mb-4 p-4 border rounded">
                            <input
                                type="text"
                                placeholder="Exercise Name"
                                value={exercise.name}
                                onChange={(e) => handleExerciseChange(exerciseIndex, 'name', e.target.value)}
                                className="mb-2 p-2 border rounded w-full"
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
                    
                    <button
                        type="button"
                        onClick={addExercise}
                        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Exercise
                    </button>
                    
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
                    {workouts.map((workout, index) => (
                        <div key={index} className="mb-4 p-4 border rounded">
                            <div className="font-semibold">Date: {workout.date}</div>
                            {workout.exercises.map((exercise, exerciseIndex) => (
                                <div key={exerciseIndex} className="ml-4 mt-2">
                                    <div className="font-medium">{exercise.name}</div>
                                    {exercise.sets.map((set, setIndex) => (
                                        <div key={setIndex} className="ml-4">
                                            Set {set.set_number}: {set.weight}lbs x {set.reps} reps
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkoutTracker;
