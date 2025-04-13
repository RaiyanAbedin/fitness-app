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
    Dumbbell,
    LogOut,
    Edit,
    ClipboardList,
    Plus,
    BookOpen,
    ShoppingBag,
    Heart
} from 'lucide-react';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [tip, setTip] = useState(''); 
    const [workouts, setWorkouts] = useState([]);
    const [aiGeneratedWorkouts, setAIGeneratedWorkouts] = useState([]);
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
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-red-500 text-center p-8 bg-gray-900/50 backdrop-blur-sm border border-red-900/50 rounded-2xl">
                    <div className="text-xl font-bold">{error}</div>
                    <button 
                        onClick={() => navigate('/login')}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-[#0ff] to-[#f0f] text-black rounded-lg"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-[#0ff] text-xl">
                    <div className="animate-pulse">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* User Profile Card */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden mb-6 border border-gray-800">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-[#0ff]/30 to-[#f0f]/30 p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-black/30 p-4 rounded-full">
                                <User className="w-12 h-12 text-white" />
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
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-[#0ff]/50 transition-all">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-[#0ff] p-2 rounded-full text-black">
                                        <Weight className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-300">Weight</h3>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-2xl font-bold text-white">{userData.weight} kg</p>
                                    <div className="text-gray-400 flex items-center text-sm">
                                        <Activity className="w-4 h-4" />
                                        <span>Age: {userData.age} | {userData.height} cm</span>
                                    </div>
                                </div>
                            </div>

                            {/* Goal Stat */}
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-[#f0f]/50 transition-all">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-[#f0f] p-2 rounded-full text-black">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-300">Goals</h3>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-xl font-bold text-white">{userData.goals}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Activity className="w-4 h-4 text-[#f0f]" />
                                        <span className="text-sm text-gray-400">Fitness journey in progress</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dietary Preferences */}
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-[#0ff]/50 transition-all">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-[#0ff] p-2 rounded-full text-black">
                                        <Apple className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-300">Dietary Preferences</h3>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.dietary_preferences && userData.dietary_preferences.length > 0 ? (
                                        userData.dietary_preferences.map((pref, index) => (
                                            <span key={index} className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm flex items-center gap-1">
                                                {pref.toLowerCase().includes('vegan') ? (
                                                    <><Leaf className="w-3 h-3 text-[#0ff]" /> {pref}</>
                                                ) : pref.toLowerCase().includes('gluten') ? (
                                                    <><Wheat className="w-3 h-3 text-[#0ff]" /> {pref}</>
                                                ) : (
                                                    <><Apple className="w-3 h-3 text-[#0ff]" /> {pref}</>
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
                                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200 text-sm flex items-center gap-2 border border-gray-700"
                            >
                                <Edit className="w-4 h-4" /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Motivational Tip Section */}
                <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 mb-6 relative overflow-hidden">
                    <div className="absolute -bottom-4 -right-4 h-32 w-32 bg-[#0ff] opacity-10 blur-3xl rounded-full"></div>
                    <div className="absolute -top-4 -left-4 h-32 w-32 bg-[#f0f] opacity-10 blur-3xl rounded-full"></div>
                    <h2 className="text-xl font-semibold mb-4 text-white relative z-10">Daily Motivation</h2>
                    <p className="text-[#0ff] italic text-lg text-center relative z-10">{tip || 'Loading tip...'}</p>
                </div>

                {/* Latest AI-Generated Workout Section */}
                <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-white-800 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-white">Your Latest Workout</h2>
                    {aiGeneratedWorkouts.length > 0 ? (
                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                            <div className="flex flex-wrap justify-between mb-3">
                                <span className="font-medium text-gray-300">
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
                            className="bg-gradient-to-r from-[#0ff] to-[#f0f] text-black px-4 py-2 rounded-lg hover:opacity-90 text-sm font-medium"
                        >
                            View All Workouts
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-800">
                    <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/workout-tracker')}
                            className="bg-gray-800/60 text-white px-6 py-4 rounded-xl hover:bg-gray-700 transition duration-200 flex items-center gap-3 border border-gray-700 hover:border-[#0ff]"
                        >
                            <ClipboardList className="w-5 h-5 text-[#0ff]" />
                            <span>Workout Tracker</span>
                        </button>

                        <button
                            onClick={() => navigate('/generate-workout')}
                            className="bg-gray-800/60 text-white px-6 py-4 rounded-xl hover:bg-gray-700 transition duration-200 flex items-center gap-3 border border-gray-700 hover:border-[#0ff]"
                        >
                            <Plus className="w-5 h-5 text-[#0ff]" />
                            <span>Generate Workout</span>
                        </button>

                        <button
                            onClick={handleEditProfile}
                            className="bg-gray-800/60 text-white px-6 py-4 rounded-xl hover:bg-gray-700 transition duration-200 flex items-center gap-3 border border-gray-700 hover:border-[#f0f]"
                        >
                            <Edit className="w-5 h-5 text-[#f0f]" />
                            <span>Edit Profile</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-gray-800/60 text-white px-6 py-4 rounded-xl hover:bg-gray-700 transition duration-200 flex items-center gap-3 border border-gray-700 hover:border-red-500"
                        >
                            <LogOut className="w-5 h-5 text-red-400" />
                            <span>Logout</span>
                        </button>

                        <button
                            onClick={() => navigate('/workout-planner')}
                            className="bg-gray-800/60 text-white px-6 py-4 rounded-xl hover:bg-gray-700 transition duration-200 flex items-center gap-3 border border-gray-700 hover:border-[#0ff]"
                        >
                            <BookOpen className="w-5 h-5 text-[#0ff]" />
                            <span>Plan Your Workouts</span>
                        </button>

                        <button
                            onClick={() => navigate('/nutrition')}
                            className="bg-gray-800/60 text-white px-6 py-4 rounded-xl hover:bg-gray-700 transition duration-200 flex items-center gap-3 border border-gray-700 hover:border-[#f0f]"
                        >
                            <Apple className="w-5 h-5 text-[#f0f]" />
                            <span>Nutrition Hub</span>
                        </button>

                        <button
                            onClick={() => navigate('/shopping-list')}
                            className="bg-gray-800/60 text-white px-6 py-4 rounded-xl hover:bg-gray-700 transition duration-200 flex items-center gap-3 border border-gray-700 hover:border-[#0ff]"
                        >
                            <ShoppingBag className="w-5 h-5 text-[#0ff]" />
                            <span>Shopping List</span>
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;