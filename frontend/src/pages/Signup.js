import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

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
    const navigate = useNavigate(); // Initialize navigate hook

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
    
        // If checked, add the value to the dietary_preferences array
        if (checked) {
            setFormData((prevData) => ({
                ...prevData,
                dietary_preferences: [...prevData.dietary_preferences, value],
            }));
        } else {
            // If unchecked, remove the value from the dietary_preferences array
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

            // Store the user_id in localStorage
            localStorage.setItem('user_id', response.data.user_id);

            // Redirect to the dashboard
            navigate('/dashboard');
        } catch (error) {
            setMessage('');
            setErrors({});
            setMessage(`Error: ${error.response?.data?.error || 'An error occurred.'}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 text-gray-800">
            <h1 className="text-2xl font-bold mb-6">Embrace the grind, ascend to greatness.</h1>
            <form
                className="flex flex-col bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                onSubmit={handleSubmit}
            >
                {/* Name */}
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`mb-2 px-4 py-2 border rounded ${errors.name && 'border-red-500'}`}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

                {/* Gender */}
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`mb-2 px-4 py-2 border rounded ${errors.gender && 'border-red-500'}`}
                >
                    <option value="" disabled>
                        Select your gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}


                {/* Email */}
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mb-2 px-4 py-2 border rounded ${errors.email && 'border-red-500'}`}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

                {/* Password */}
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`mb-2 px-4 py-2 border rounded ${
                        errors.password && 'border-red-500'
                    }`}
                />
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

                {/* Age */}
                <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    className={`mb-2 px-4 py-2 border rounded ${errors.age && 'border-red-500'}`}
                />
                {errors.age && <p className="text-red-500 text-xs">{errors.age}</p>}

                {/* Height */}
                <input
                    type="number"
                    name="height"
                    placeholder="Height (cm)"
                    value={formData.height}
                    onChange={handleChange}
                    className={`mb-2 px-4 py-2 border rounded ${errors.height && 'border-red-500'}`}
                />
                {errors.height && <p className="text-red-500 text-xs">{errors.height}</p>}

                {/* Weight */}
                <input
                    type="number"
                    name="weight"
                    placeholder="Weight (kg)"
                    value={formData.weight}
                    onChange={handleChange}
                    className={`mb-2 px-4 py-2 border rounded ${errors.weight && 'border-red-500'}`}
                />
                {errors.weight && <p className="text-red-500 text-xs">{errors.weight}</p>}

                {/* Goals */}
                <select
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    className={`mb-2 px-4 py-2 border rounded ${errors.goals && 'border-red-500'}`}
                >
                    <option value="" disabled>
                        Select your goal
                    </option>
                    <option value="Gain Weight">Gain Weight</option>
                    <option value="Lose Weight">Lose Weight</option>
                    <option value="Maintain Body Fat">Maintain Body Fat</option>
                </select>
                {errors.goals && <p className="text-red-500 text-xs">{errors.goals}</p>}

                {/* Dietary Preferences */}
<div className="mb-4">
    <label className="font-bold mb-2 block">Dietary Preferences</label>
    <div className="flex flex-col gap-y-2">
        <label className="flex items-center">
            <input
                type="checkbox"
                name="dietary_preferences"
                value="Halal"
                checked={formData.dietary_preferences.includes('Halal')}
                onChange={handleCheckboxChange}
                className="mr-2"
            />
            Halal
        </label>
        <label className="flex items-center">
            <input
                type="checkbox"
                name="dietary_preferences"
                value="Vegan"
                checked={formData.dietary_preferences.includes('Vegan')}
                onChange={handleCheckboxChange}
                className="mr-2"
            />
            Vegan
        </label>
        <label className="flex items-center">
            <input
                type="checkbox"
                name="dietary_preferences"
                value="Vegetarian"
                checked={formData.dietary_preferences.includes('Vegetarian')}
                onChange={handleCheckboxChange}
                className="mr-2"
            />
            Vegetarian
        </label>
        <label className="flex items-center">
            <input
                type="checkbox"
                name="dietary_preferences"
                value="Gluten-Free"
                checked={formData.dietary_preferences.includes('Gluten-Free')}
                onChange={handleCheckboxChange}
                className="mr-2"
            />
            Gluten-Free
        </label>
    </div>
    {errors.dietary_preferences && (
        <p className="text-red-500 text-xs">{errors.dietary_preferences}</p>
    )}
</div>



                <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                    Start Forging Your Own Legend.
                </button>
            </form>
            {message && <p className="text-blue-500">{message}</p>}


            <button
                onClick={() => navigate('/login')} // Navigate to signup page
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
                Already have an account? Log In
            </button>

        </div>
    );
};

export default Signup;
