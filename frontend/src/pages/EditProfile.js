import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, Ruler, Weight, Target, Salad, Save } from 'lucide-react';

const EditProfile = () => {
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        height: '',
        weight: '',
        goals: '',
        dietary_preferences: [],
        gender: '',
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Fetch user data when the component loads
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem('user_id');
                if (!userId) {
                    console.error('User not logged in.');
                    setError('User not logged in.');
                    return;
                }

                const response = await axios.get(`http://127.0.0.1:5000/api/users/${userId}`);
                setUserData(response.data);
                setFormData({ ...response.data, dietary_preferences: response.data.dietary_preferences || [] });
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

            setMessage(response.data.message);
            setError('');
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('Failed to update profile.');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <div className="text-red-500 text-center font-semibold mb-4">{error}</div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-blue-500 text-xl animate-pulse">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <User className="w-6 h-6 text-blue-500" />
                        Edit Profile
                    </h1>
                    
                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit}
                    >
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Age */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Age</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Height */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Ruler className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                        className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Weight className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Goals */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Fitness Goal</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Target className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    name="goals"
                                    value={formData.goals}
                                    onChange={handleChange}
                                    className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="" disabled>Select your goal</option>
                                    <option value="Gain Weight">Gain Weight</option>
                                    <option value="Lose Weight">Lose Weight</option>
                                    <option value="Maintain Body Fat">Maintain Body Fat</option>
                                </select>
                            </div>
                        </div>

                        {/* Dietary Preferences */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Salad className="h-5 w-5 text-green-500" />
                                Dietary Preferences
                            </label>
                            <div className="bg-gray-50 p-4 rounded border grid grid-cols-2 gap-4">
                                {['Halal', 'Vegan', 'Vegetarian', 'Gluten-Free'].map((pref) => (
                                    <label key={pref} className="flex items-center mr-4">
                                        <input
                                            type="checkbox"
                                            name="dietary_preferences"
                                            value={pref}
                                            checked={formData.dietary_preferences.includes(pref)}
                                            onChange={handleCheckboxChange}
                                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">{pref}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {message && <p className="text-green-500 font-medium">{message}</p>}
                        {error && <p className="text-red-500 font-medium">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Update Profile
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;