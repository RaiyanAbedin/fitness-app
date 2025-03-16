import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import WorkoutDisplay from './WorkoutDisplay';

import { 
    Weight, 
    Target, 
    Apple, 
    User, 
    Calendar, 
    ArrowUp, 
    Activity,
    Leaf,
    Wheat,
    Dumbells,
  } from 'lucide-react';

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
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-violet-800 to-violet-100 p-6 text-white">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-4 rounded-full">
                                <User className="w-12 h-12" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{userData.name}</h2>
                                <p className="opacity-80 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{userData.email}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Stats */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Weight Stat */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-blue-500 p-2 rounded-full text-white">
                                        <Weight className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700">Weight</h3>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-2xl font-bold text-blue-700">{userData.weight} kg</p>
                                    <div className="text-gray-600 flex items-center text-sm">
                                        <Activity className="w-4 h-4" />
                                        <span>Age: {userData.age} | {userData.height} cm</span>
                                    </div>
                                </div>
                            </div>

                            {/* Goal Stat */}
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-purple-500 p-2 rounded-full text-white">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700">Goals</h3>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-xl font-bold text-purple-700">{userData.goals}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Activity className="w-4 h-4 text-purple-500" />
                                        <span className="text-sm text-gray-600">Fitness journey in progress</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dietary Preferences */}
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-green-500 p-2 rounded-full text-white">
                                        <Apple className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700">Dietary Preferences</h3>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.dietary_preferences && userData.dietary_preferences.length > 0 ? (
                                        userData.dietary_preferences.map((pref, index) => (
                                            <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                                                {pref.toLowerCase().includes('vegan') ? (
                                                    <><Leaf className="w-3 h-3" /> {pref}</>
                                                ) : pref.toLowerCase().includes('gluten') ? (
                                                    <><Wheat className="w-3 h-3" /> {pref}</>
                                                ) : (
                                                    <><Apple className="w-3 h-3" /> {pref}</>
                                                )}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500">No preferences specified</span>
                                    )}
                                </div>
                            </div>
        </div>

        <div className="flex justify-end mt-4">
            <button
                onClick={handleEditProfile}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 text-sm"
            >
                Edit Profile
            </button>
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

                        <button
                            onClick={() => navigate('/nutrition')}
                            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition duration-200"
                        >
                            Nutrition Hub
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;