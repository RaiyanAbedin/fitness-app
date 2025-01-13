import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
            setMessage(response.data.message);
            setError('');
            localStorage.setItem('user_id', response.data.user_id);
            navigate('/dashboard');
        } catch (err) {
            setMessage('');
            setError(err.response?.data?.error || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-4">
            {/* Responsive "Greetings, Warrior" Text */}
            <h1 className="text-center font-bold mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                Greetings, Warrior!
            </h1>

            {/* Login Form */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
            >
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mb-4 px-4 py-2 border rounded w-full"
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mb-4 px-4 py-2 border rounded w-full"
                    required
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
                >
                    Log In
                </button>
            </form>

            {/* Display Messages */}
            {message && <p className="text-green-500">{message}</p>}
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
};

export default Login;
