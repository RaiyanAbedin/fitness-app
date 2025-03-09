import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import WorkoutDisplay from './WorkoutDisplay';

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

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

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
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* User Profile Card */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h1 className="text-2xl font-bold mb-4">Welcome, {userData.name}!</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600 mb-1">Email</p>
                            <p className="text-gray-800 font-medium mb-3">{userData.email}</p>
                            
                            <p className="text-gray-600 mb-1">Age</p>
                            <p className="text-gray-800 font-medium mb-3">{userData.age}</p>
                            
                            <p className="text-gray-600 mb-1">Height</p>
                            <p className="text-gray-800 font-medium mb-3">{userData.height} cm</p>
                        </div>
                        <div>
                            <p className="text-gray-600 mb-1">Weight</p>
                            <p className="text-gray-800 font-medium mb-3">{userData.weight} kg</p>
                            
                            <p className="text-gray-600 mb-1">Goals</p>
                            <p className="text-gray-800 font-medium mb-3">{userData.goals}</p>
                            
                            <p className="text-gray-600 mb-1">Dietary Preferences</p>
                            <p className="text-gray-800 font-medium">
                                {userData.dietary_preferences?.join(', ') || 'None specified'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Motivational Tip Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-4">Daily Motivation</h2>
                    <p className="text-blue-500 italic text-lg text-center">{tip || 'Loading tip...'}</p>
                </div>

                {/* Latest AI-Generated Workout Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-4">Your Latest Workout</h2>
                    {aiGeneratedWorkouts.length > 0 ? (
                        <div className="bg-gray-50 p-4 rounded border">
                            <div className="flex flex-wrap justify-between mb-3">
                                <span className="font-medium text-gray-800">
                                    {formatDate(aiGeneratedWorkouts[0].date)}
                                </span>
                            </div>
                            <WorkoutDisplay workoutData={aiGeneratedWorkouts[0].workout_details} showSaveButton={false} />

                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            No workout history yet. Generate your first workout to get started!
                        </p>
                    )}
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/generate-workout')}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                        >
                            View All Workouts
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/workout-tracker')}
                            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition duration-200"
                        >
                            Workout Tracker
                        </button>

                        <button
                            onClick={() => navigate('/generate-workout')}
                            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition duration-200"
                        >
                            Generate Workout
                        </button>

                        <button
                            onClick={handleEditProfile}
                            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition duration-200"
                        >
                            Edit Profile
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition duration-200"
                        >
                            Logout
                        </button>

                        <button
                        onClick={() => navigate('/workout-planner')}
                        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition duration-200"
                    >
                        Plan Your Workouts
                    </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;