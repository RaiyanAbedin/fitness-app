import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SavedWorkouts = () => {
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWorkoutHistory();
    }, []);

    const fetchWorkoutHistory = async () => {
        const userId = localStorage.getItem('user_id'); // Ensure user_id is stored in localStorage
        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/workout-history/${userId}`);
            setWorkoutHistory(response.data.workout_logs || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch saved workouts.');
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Saved AI-Generated Workouts</h1>

                {workoutHistory.length === 0 ? (
                    <p>No saved workouts found.</p>
                ) : (
                    workoutHistory.map((workout, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 mb-4 shadow-md">
                            <h2 className="font-semibold">Date: {workout.date}</h2>
                            <p className="mt-2">{workout.workout_details}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SavedWorkouts;
