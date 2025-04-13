import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Mail, Lock, Calendar, Ruler, Weight, Target, Salad } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        email: '',
        password: '',
        age: '',
        height: '',
        weight: '',
        goals: '',
        dietary_preferences: [],
    });

    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) newErrors.name = 'Name is required.';
        if (!formData.gender) newErrors.gender = 'Please select your gender.';
        if (!formData.email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email))
            newErrors.email = 'Enter a valid email address.';
        if (!formData.password || formData.password.length < 8)
            newErrors.password = 'Password must be at least 8 characters long.';
        if (formData.age && (isNaN(formData.age) || formData.age <= 0))
            newErrors.age = 'Age must be a positive number.';
        if (formData.height && (isNaN(formData.height) || formData.height <= 0))
            newErrors.height = 'Height must be a positive number.';
        if (formData.weight && (isNaN(formData.weight) || formData.weight <= 0))
            newErrors.weight = 'Weight must be a positive number.';
        if (!formData.goals) newErrors.goals = 'Please select a fitness goal.';
        if (!formData.dietary_preferences.length)
            newErrors.dietary_preferences = 'Please select at least one dietary preference.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
    
        if (checked) {
            setFormData((prevData) => ({
                ...prevData,
                dietary_preferences: [...prevData.dietary_preferences, value],
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                dietary_preferences: prevData.dietary_preferences.filter(
                    (preference) => preference !== value
                ),
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/signup', formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setMessage(`Success: ${response.data.message}`);
            setErrors({});
            localStorage.setItem('user_id', response.data.user_id);
            navigate('/dashboard');
        } catch (error) {
            setMessage('');
            setErrors({});
            setMessage(`Error: ${error.response?.data?.error || 'An error occurred.'}`);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white py-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Logo/Branding */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0ff] to-[#f0f]">
                        NuroFit
                    </h1>
                    <p className="text-gray-400 mt-2">Begin Your Fitness Journey</p>
                </div>
                
                {/* Signup Form */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <div className="space-y-2">
                                <label className="text-gray-300 block text-sm">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <User className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`bg-gray-800/50 border ${errors.name ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg block w-full pl-10 p-3 focus:ring-[#0ff] focus:border-[#0ff] outline-none`}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-gray-300 block text-sm">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className={`bg-gray-800/50 border ${errors.gender ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg block w-full p-3 focus:ring-[#0ff] focus:border-[#0ff] outline-none`}
                                >
                                    <option value="" disabled>Select your gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-gray-300 block text-sm">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`bg-gray-800/50 border ${errors.email ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg block w-full pl-10 p-3 focus:ring-[#0ff] focus:border-[#0ff] outline-none`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-gray-300 block text-sm">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`bg-gray-800/50 border ${errors.password ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg block w-full pl-10 p-3 focus:ring-[#0ff] focus:border-[#0ff] outline-none`}
                                    />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>
                            </div>
                            
                            {/* Physical Attributes */}
                            <div className="space-y-2">
                                <label className="text-gray-300 block text-sm">Age</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Calendar className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className={`bg-gray-800/50 border ${errors.age ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg block w-full pl-10 p-3 focus:ring-[#0ff] focus:border-[#0ff] outline-none`}
                                    />
                                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-gray-300 block text-sm">Height (cm)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Ruler className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                        className={`bg-gray-800/50 border ${errors.height ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg block w-full pl-10 p-3 focus:ring-[#0ff] focus:border-[#0ff] outline-none`}
                                    />
                                    {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-gray-300 block text-sm">Weight (kg)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Weight className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className={`bg-gray-800/50 border ${errors.weight ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg block w-full pl-10 p-3 focus:ring-[#0ff] focus:border-[#0ff] outline-none`}
                                    />
                                    {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-gray-300 block text-sm">Fitness Goal</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Target className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <select
                                        name="goals"
                                        value={formData.goals}
                                        onChange={handleChange}
                                        className={`bg-gray-800/50 border ${errors.goals ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg block w-full pl-10 p-3 focus:ring-[#0ff] focus:border-[#0ff] outline-none`}
                                    >
                                        <option value="" disabled>Select your goal</option>
                                        <option value="Gain Weight">Gain Weight</option>
                                        <option value="Lose Weight">Lose Weight</option>
                                        <option value="Maintain Body Fat">Maintain Body Fat</option>
                                    </select>
                                    {errors.goals && <p className="text-red-500 text-xs mt-1">{errors.goals}</p>}
                                </div>
                            </div>
                        </div>
                        
                        {/* Dietary Preferences */}
                        <div className="space-y-3">
                            <label className="text-gray-300 block">
                                <Salad className="inline-block h-5 w-5 text-[#0ff] mr-2" />
                                Dietary Preferences
                            </label>
                            <div className={`bg-gray-800/50 border ${errors.dietary_preferences ? 'border-red-500' : 'border-gray-700'} rounded-lg p-4 grid grid-cols-2 gap-3`}>
                                {['Halal', 'Vegan', 'Vegetarian', 'Gluten-Free'].map((pref) => (
                                    <label key={pref} className="flex items-center space-x-2 text-gray-300">
                                        <input
                                            type="checkbox"
                                            name="dietary_preferences"
                                            value={pref}
                                            checked={formData.dietary_preferences.includes(pref)}
                                            onChange={handleCheckboxChange}
                                            className="rounded bg-gray-700 border-gray-600 text-[#0ff] focus:ring-[#0ff] focus:ring-offset-gray-800"
                                        />
                                        <span>{pref}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.dietary_preferences && (
                                <p className="text-red-500 text-xs">{errors.dietary_preferences}</p>
                            )}
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#0ff] to-[#f0f] hover:opacity-90 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center"
                        >
                            Create Account <ArrowRight className="ml-2 h-5 w-5" />
                        </button>
                    </form>
                    
                    {/* Error/Success Messages */}
                    {message && (
                        <div className={`mt-4 p-3 rounded-lg text-center ${message.includes('Error') ? 'bg-red-900/50 border border-red-800 text-red-200' : 'bg-green-900/50 border border-green-800 text-green-200'}`}>
                            {message}
                        </div>
                    )}
                </div>
                
                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        Already have an account?{' '}
                        <button 
                            onClick={() => navigate('/login')}
                            className="text-[#0ff] hover:underline"
                        >
                            Log In
                        </button>
                    </p>
                </div>
                
                {/* Back to Home Link */}
                <div className="mt-4 text-center">
                    <button 
                        onClick={() => navigate('/')}
                        className="text-gray-500 hover:text-gray-300 text-sm"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Signup;