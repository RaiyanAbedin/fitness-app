import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
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
            } catch (err) {
                console.error(err);
                setError('Failed to fetch user data.');
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        // Clear localStorage and redirect to login
        localStorage.removeItem('user_id');
        navigate('/login');
    };

    const handleEditProfile = () => {
        navigate('/edit-profile'); // Redirect to the Edit Profile page
    };

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    if (!userData) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-blue-100 flex flex-col items-center p-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6">
                Welcome, {userData.name}!
            </h1>
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">Your Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* User Info */}
                    <p className="text-lg">
                        <span className="font-semibold">Email:</span> {userData.email}
                    </p>
                    <p className="text-lg">
                        <span className="font-semibold">Age:</span> {userData.age}
                    </p>
                    <p className="text-lg">
                        <span className="font-semibold">Height:</span> {userData.height} cm
                    </p>
                    <p className="text-lg">
                        <span className="font-semibold">Weight:</span> {userData.weight} kg
                    </p>
                    <p className="text-lg">
                        <span className="font-semibold">Goals:</span> {userData.goals}
                    </p>
                    <p className="text-lg">
                        <span className="font-semibold">Dietary Preferences:</span>{' '}
                        {userData.dietary_preferences?.join(', ')}
                    </p>
                    <p className="text-lg">
                        <span className="font-semibold">Gender:</span> {userData.gender}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
                    >
                        Logout
                    </button>
                    {/* Edit Profile Button */}
                    <button
                        onClick={handleEditProfile}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full sm:w-auto"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
