import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const [userData, setUserData] = useState(null); // Stores fetched user data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        height: '',
        weight: '',
        goals: '',
        dietary_preferences: [], // Initialize with an empty array
        gender: '',
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Fetch user data when the component loads
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem('user_id'); // Get user ID from localStorage
                if (!userId) {
                    console.error('User not logged in.');
                    setError('User not logged in.');
                    return;
                }

                const response = await axios.get(`http://127.0.0.1:5000/api/users/${userId}`);
                setUserData(response.data); // Store the fetched user data
                setFormData({ ...response.data, dietary_preferences: response.data.dietary_preferences || [] }); // Ensure dietary_preferences is an array
                setError('');
            } catch (err) {
                console.error('Failed to fetch user data:', err);
                setError('Failed to fetch user data.');
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;

        // Add or remove dietary preferences based on the checkbox state
        setFormData((prevData) => ({
            ...prevData,
            dietary_preferences: checked
                ? [...prevData.dietary_preferences, value]
                : prevData.dietary_preferences.filter((pref) => pref !== value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setError('User not logged in.');
                return;
            }

            const response = await axios.put(
                `http://127.0.0.1:5000/api/users/${userId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            setMessage(response.data.message); // Show success message
            setError('');
            navigate('/dashboard'); // Redirect to the dashboard after update
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('Failed to update profile.');
        }
    };

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    if (!userData) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
            <form
                className="flex flex-col bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                onSubmit={handleSubmit}
            >
                {/* Name */}
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    className="mb-4 px-4 py-2 border rounded"
                />

                {/* Email */}
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="mb-4 px-4 py-2 border rounded"
                />

                {/* Age */}
                <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Age"
                    className="mb-4 px-4 py-2 border rounded"
                />

                {/* Height */}
                <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Height (cm)"
                    className="mb-4 px-4 py-2 border rounded"
                />

                {/* Weight */}
                <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Weight (kg)"
                    className="mb-4 px-4 py-2 border rounded"
                />

                {/* Goals */}
                <select
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    className="mb-4 px-4 py-2 border rounded"
                >
                    <option value="" disabled>
                        Select your goal
                    </option>
                    <option value="Gain Weight">Gain Weight</option>
                    <option value="Lose Weight">Lose Weight</option>
                    <option value="Maintain Body Fat">Maintain Body Fat</option>
                </select>

                {/* Dietary Preferences */}
                <div className="mb-4">
                    <label className="font-bold mb-2 block">Dietary Preferences</label>
                    <div className="flex flex-wrap">
                        {['Halal', 'Vegan', 'Vegetarian', 'Gluten-Free'].map((pref) => (
                            <label key={pref} className="flex items-center mr-4">
                                <input
                                    type="checkbox"
                                    name="dietary_preferences"
                                    value={pref}
                                    checked={formData.dietary_preferences.includes(pref)}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
                                {pref}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Gender */}
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mb-4 px-4 py-2 border rounded"
                >
                    <option value="" disabled>
                        Select Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                    Update Profile
                </button>
            </form>
            {message && <p className="text-green-500">{message}</p>}
        </div>
    );
};

export default EditProfile;
