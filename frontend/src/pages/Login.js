import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate(); // Add navigation hook
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/login', formData, {
                headers: { 'Content-Type': 'application/json' },
            });

            // Save the user_id to local storage
            localStorage.setItem('user_id', response.data.user_id);

            // Display success message and navigate to dashboard
            setMessage(response.data.message);
            setError('');
            console.log("Login successful:", response.data);

            navigate('/dashboard'); // Navigate to dashboard on success
        } catch (err) {
            setMessage('');
            setError(err.response?.data?.error || 'An error occurred. Please try again.');
            console.error(err.response?.data);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100">
            <h1 className="text-2xl font-bold mb-6">Gretings Warrior, Return Back To Action.</h1>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
            >
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mb-4 px-4 py-2 border rounded"
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mb-4 px-4 py-2 border rounded"
                    required
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                    Log In
                </button>
            </form>
            {message && <p className="text-green-500">{message}</p>}
            {error && <p className="text-red-500">{error}</p>}

            <button
                onClick={() => navigate('/signup')} // Navigate to signup page
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
                Don't have an account? Sign Up
            </button>


        </div>
    );
};

export default Login;
