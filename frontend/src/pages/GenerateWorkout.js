import React, { useState } from 'react';
import axios from 'axios';

const GenerateWorkout = () => {
    const [goal, setGoal] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [timeAvailable, setTimeAvailable] = useState('');
    const [workout, setWorkout] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/generate-workout', {
                goal,
                experience_level: experienceLevel,
                time_available: timeAvailable
            });
            setWorkout(response.data.workout);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to generate workout. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4">Generate AI-Workout</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-2">Goal</label>
                        <input
                            type="text"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="E.g., Gain Muscle, Lose Weight"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-2">Experience Level</label>
                        <select
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select Experience Level</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium mb-2">Time Available (in minutes)</label>
                        <input
                            type="number"
                            value={timeAvailable}
                            onChange={(e) => setTimeAvailable(e.target.value)}
                            placeholder="E.g., 30"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Generate Workout
                    </button>
                </form>

                {/* Display Generated Workout */}
                {workout && (
                    <div className="mt-6 bg-gray-50 p-4 rounded border">
                        <h2 className="text-xl font-semibold mb-2">Your Workout Plan</h2>
                        <pre className="whitespace-pre-wrap">{workout}</pre>
                    </div>
                )}

                {/* Error Message */}
                {error && <div className="mt-4 text-red-500">{error}</div>}
            </div>
        </div>
    );
};

export default GenerateWorkout;
