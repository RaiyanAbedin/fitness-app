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

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    if (!userData) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-6">Welcome, {userData.name}!</h1>
            <p className="text-lg mb-4">Gender: {userData.gender}</p>
            <p className="text-lg mb-4">Email: {userData.email}</p>
            <p className="text-lg mb-4">Age: {userData.age}</p>
            <p className="text-lg mb-4">Height: {userData.height}</p>
            <p className="text-lg mb-4">Weight: {userData.weight}</p>
            <p className="text-lg mb-4">Goals: {userData.goals}</p>
            <p className="text-lg mb-4">
    Dietary Preferences: {Array.isArray(userData.dietary_preferences) && userData.dietary_preferences.length > 0
        ? userData.dietary_preferences.join(', ')
        : 'No dietary preferences selected.'}
</p>

            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 mt-4"
            >
                Logout
            </button>
            {/* Add Edit Profile Button */}
            <button
                onClick={() => navigate('/edit-profile')}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mt-4"
            >
                Edit Profile
            </button>
        </div>
    );
};

export default Dashboard;
