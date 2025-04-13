import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Lock } from 'lucide-react';

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
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Branding */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0ff] to-[#f0f]">
                        NuroFit
                    </h1>
                    <p className="text-gray-400 mt-2">Your AI Fitness & Nutrition Coach</p>
                </div>
                
                {/* Login Form */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-gray-300 block text-sm">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <User className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="bg-gray-800/50 border border-gray-700 text-white rounded-lg block w-full pl-10 p-3 focus:ring-[#0ff] focus:border-[#0ff] outline-none"
                                    required
                                />
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
                                    className="bg-gray-800/50 border border-gray-700 text-white rounded-lg block w-full pl-10 p-3 focus:ring-[#0ff] focus:border-[#0ff] outline-none"
                                    required
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#0ff] to-[#f0f] hover:opacity-90 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center"
                        >
                            Login <ArrowRight className="ml-2 h-5 w-5" />
                        </button>
                    </form>
                    
                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-900/50 border border-red-800 text-red-200 rounded-lg text-center">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="mt-4 p-3 bg-green-900/50 border border-green-800 text-green-200 rounded-lg text-center">
                            {message}
                        </div>
                    )}
                </div>
                
                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        Don't have an account?{' '}
                        <button 
                            onClick={() => navigate('/signup')}
                            className="text-[#0ff] hover:underline"
                        >
                            Sign Up
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

export default Login;