import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 text-gray-800 p-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center">
                Welcome to Your Fitness App
            </h1>
            <p className="text-md sm:text-lg md:text-xl text-center mb-6">
                Your journey to health starts here!
            </p>
            <div className="flex flex-col space-y-4">
                <button
                    onClick={() => navigate('/signup')}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 text-sm sm:text-md md:text-lg"
                >
                    Sign Up 
                </button>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 text-sm sm:text-md md:text-lg"
                >
                    Log In
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
