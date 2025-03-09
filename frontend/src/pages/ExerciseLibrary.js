// ExerciseLibrary.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExerciseLibrary = ({ onAddToCustomPlan }) => {
    const [exercises, setExercises] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExercises();
    }, [selectedCategory]);

    const fetchExercises = async () => {
        setLoading(true);
        try {
            const url = selectedCategory === 'all' 
                ? 'http://127.0.0.1:5000/api/exercise-library'
                : `http://127.0.0.1:5000/api/exercise-library?category=${selectedCategory}`;
                
            const response = await axios.get(url);
            if (response.data.exercises) {
                setExercises(response.data.exercises);
            }
        } catch (err) {
            console.error("Error fetching exercise library:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCustomPlan = (exercise) => {
        onAddToCustomPlan({
            exercise_name: exercise.name,
            sets: exercise.recommended_sets,
            reps: exercise.recommended_reps
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Exercise Library</h2>
            
            <div className="mb-4">
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="all">All Categories</option>
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="core">Core</option>
                </select>
            </div>
            
            {loading ? (
                <p className="text-center">Loading exercises...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exercises.map((exercise, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <h3 className="text-lg font-bold">{exercise.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">
                                {exercise.muscles_targeted.join(', ')}
                            </p>
                            <div className="flex justify-between mt-3">
                                <button
                                    onClick={() => setSelectedExercise(exercise)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => handleAddToCustomPlan(exercise)}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add to Plan
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Exercise Details Modal */}
            {selectedExercise && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">{selectedExercise.name}</h2>
                        
                        <div className="mb-4">
                            <h3 className="font-semibold">Difficulty:</h3>
                            <p className="capitalize">{selectedExercise.difficulty}</p>
                        </div>
                        
                        <div className="mb-4">
                            <h3 className="font-semibold">How to perform:</h3>
                            <p>{selectedExercise.instructions}</p>
                        </div>
                        
                        <div className="mb-4">
                            <h3 className="font-semibold">Muscles targeted:</h3>
                            <p>{selectedExercise.muscles_targeted.join(', ')}</p>
                        </div>
                        
                        <div className="mb-4">
                            <h3 className="font-semibold">Recommended:</h3>
                            <p>{selectedExercise.recommended_sets} sets of {selectedExercise.recommended_reps}</p>
                        </div>
                        
                        <div className="flex justify-between">
                            <button 
                                onClick={() => handleAddToCustomPlan(selectedExercise)}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Add to Plan
                            </button>
                            
                            <button 
                                onClick={() => setSelectedExercise(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExerciseLibrary;