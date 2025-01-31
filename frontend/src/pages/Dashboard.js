import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [tip, setTip] = useState(''); // State for the motivational tip
    const [workouts, setWorkouts] = useState([]); // State for recommended workouts
    const [aiGeneratedWorkouts, setAIGeneratedWorkouts] = useState([]); // State for AI-generated workouts
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem('user_id');
                if (!userId) {
                    setError('User not logged in.');
                    return;
                }

                const response = await axios.get(`http://127.0.0.1:5000/api/users/${userId}`);
                setUserData(response.data);
                setError('');

                // Fetch workouts based on user's goals
                if (response.data.goals) {
                    console.log("Fetching workouts for goal:", response.data.goals);
                    const workoutResponse = await axios.get(
                        `http://127.0.0.1:5000/api/workouts/${encodeURIComponent(response.data.goals)}`
                    );
                    console.log("Fetched workouts:", workoutResponse.data.workouts);
                    setWorkouts(workoutResponse.data.workouts || []);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch user data or workouts.');
            }
        };

        const fetchTip = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/api/tip');
                setTip(response.data.tip);
            } catch (err) {
                console.error('Failed to fetch the motivational tip.');
            }
        };

        const fetchAIGeneratedWorkouts = async () => {
            const userId = localStorage.getItem('user_id');
            try {
                const response = await axios.get(`http://127.0.0.1:5000/api/workout-history/${userId}`);
                console.log("Fetched AI-generated workouts:", response.data.workout_logs);
                setAIGeneratedWorkouts(response.data.workout_logs || []);
            } catch (err) {
                console.error('Failed to fetch AI-generated workouts.');
            }
        };

        fetchUserData();
        fetchTip();
        fetchAIGeneratedWorkouts();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user_id');
        navigate('/login');
    };

    const handleEditProfile = () => {
        navigate('/edit-profile');
    };

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    if (!userData) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Welcome, {userData.name}!
            </h1>
            <p className="text-lg mb-4">Email: {userData.email}</p>
            <p className="text-lg mb-4">Age: {userData.age}</p>
            <p className="text-lg mb-4">Height: {userData.height} cm</p>
            <p className="text-lg mb-4">Weight: {userData.weight} kg</p>
            <p className="text-lg mb-4">Goals: {userData.goals}</p>
            <p className="text-lg mb-4">
                Dietary Preferences: {userData.dietary_preferences?.join(', ')}
            </p>

            {/* Motivational Tip Section */}
            <div className="bg-white shadow-md rounded px-8 py-6 w-full max-w-lg text-center mb-6">
                <h2 className="text-xl font-semibold mb-4">Daily Motivation</h2>
                <p className="text-blue-500 italic text-lg">{tip || 'Loading tip...'}</p>
            </div>

            {/* AI-Generated Workouts Section */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Your AI-Generated Workouts</h2>
                {aiGeneratedWorkouts.length > 0 ? (
                    aiGeneratedWorkouts.map((workout, index) => (
                        <div key={index} className="bg-gray-100 p-4 rounded mb-4 shadow">
                            <p className="text-gray-600">Date: {workout.date}</p>
                            <p className="text-gray-800">{workout.workout_details}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No AI-generated workouts saved yet.</p>
                )}
            </div>

            <div className="flex space-x-4 mt-6">
                <button
                    onClick={() => navigate('/workout-tracker')}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                    Workout Tracker
                </button>

                <button
                    onClick={() => navigate('/generate-workout')}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                    Generate Workout
                </button>

                <button
                    onClick={handleEditProfile}
                    className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                >
                    Edit Profile
                </button>

                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
