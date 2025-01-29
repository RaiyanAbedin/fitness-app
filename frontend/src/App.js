import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage'; // Landing page component
import Signup from './pages/Signup'; // Signup page component
import Login from './pages/Login'; // Login page component
import Dashboard from './pages/Dashboard';
import EditProfile from './pages/EditProfile';
import WorkoutTracker from './pages/WorkoutTracker';
import GenerateWorkout from './pages/GenerateWorkout';

const App = () => {
    return (
        <Routes>
            {/* Route for the landing page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Route for the signup/login page */}
            <Route path="/signup" element={<Signup />} />

            {/* Route for the login page */}
            <Route path="/login" element={<Login />} />

            {/* Route for the dashboard page */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Route for the edit profile page */}
            <Route path="/edit-profile" element={<EditProfile />} />

            {/* Route for the workout tracker page */}
            <Route path="/workout-tracker" element={<WorkoutTracker />} />

            {/* Route for the generate workout page */}
            <Route path="/generate-workout" element={<GenerateWorkout />} />
        </Routes>
    );
};

export default App;
