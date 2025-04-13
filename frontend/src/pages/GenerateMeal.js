import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MealDisplay from './MealDisplay';

import { 
    ArrowLeft,
    Clock,
    Utensils
} from 'lucide-react';

const GenerateMeal = () => {
    const [mealType, setMealType] = useState('');
    const [mealRequest, setMealRequest] = useState('');
    const [calories, setCalories] = useState('');
    const [meal, setMeal] = useState('');
    const [savedMeals, setSavedMeals] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setError('User not logged in.');
                setIsLoading(false);
                return;
            }
    
            console.log("Sending meal request with params:", {
                meal_type: mealType,
                meal_request: mealRequest,
                calories: calories
            });
    
            const response = await axios.post('http://127.0.0.1:5000/api/generate-meal', {
                user_id: userId,
                meal_type: mealType,
                meal_request: mealRequest,
                calories: calories || null
            });
    
            console.log("Received meal response:", response.data);
            setMeal(response.data.meal);
            await fetchSavedMeals();
        } catch (err) {
            console.error('Error generating meal:', err);
            setError('Failed to generate meal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSavedMeals = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setError('User not logged in.');
                return;
            }

            const response = await axios.get(`http://127.0.0.1:5000/api/meal-history/${userId}`);
            
            if (response.data.meal_logs) {
                setSavedMeals(response.data.meal_logs);
            } else {
                setSavedMeals([]);
            }
        } catch (err) {
            console.error('Error fetching meals:', err);
            setError('Failed to fetch saved meals.');
        }
    };

    useEffect(() => {
        fetchSavedMeals();
    }, []);

    const saveRecipe = async (dish) => {
        try {
            const userId = localStorage.getItem("user_id");
            if (!userId) {
                setError("User not logged in.");
                return;
            }

            const response = await axios.post("http://127.0.0.1:5000/api/save-recipe", {
                user_id: userId,
                recipe_name: dish.name,
                ingredients: dish.ingredients,
                instructions: dish.instructions,
                nutrition: {
                    calories: dish.calories || 0,
                    protein: dish.protein || 0,
                    carbs: dish.carbs || 0,
                    fat: dish.fat || 0
                }
            });

            if (response.status === 201) {
                alert("Recipe saved successfully!");
            }
        } catch (err) {
            console.error("Error saving recipe:", err);
            setError("Failed to save recipe.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back to Dashboard Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <button
                    onClick={() => navigate('/saved-recipes')}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
                >
                    <Utensils className="w-4 h-4" /> Saved Recipes
                </button>
                
                {/* Meal Generator Form */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Utensils className="w-6 h-6 text-green-500" />
                        Generate Meal Plan
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-medium mb-2">Meal Type</label>
                            <select
                                value={mealType}
                                onChange={(e) => setMealType(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Meal Type</option>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snack">Snack</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block font-medium mb-2">What would you like to eat?</label>
                            <input
                                type="text"
                                value={mealRequest}
                                onChange={(e) => setMealRequest(e.target.value)}
                                placeholder="E.g., pasta, salad, chicken curry, etc."
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="block font-medium mb-2">Target Calories (optional)</label>
                            <input
                                type="number"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                                placeholder="E.g., 500"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                min="1"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200 disabled:bg-green-300"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Generating...' : 'Generate Meal'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                </div>

                {/* Generated Meal Display */}
                {meal && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold mb-4">Your Generated Meal</h2>
                        <MealDisplay mealData={meal} saveRecipe={saveRecipe} />
                    </div>
                )}

                {/* Saved Meals Display */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Meal History</h2>
                    {savedMeals.length > 0 ? (
                        <div className="space-y-4">
                            {savedMeals.map((log, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded border">
                                    <div className="flex flex-wrap justify-between mb-3">
                                        <span className="font-medium text-gray-800">
                                            {new Date(log.date).toLocaleDateString()} - {log.meal_type}
                                        </span>
                                        <span className="text-gray-600 flex items-center gap-1">
                                            <Clock className="w-4 h-4" /> Generated Meal
                                        </span>
                                    </div>
                                    <MealDisplay mealData={log.meal_details} saveRecipe={saveRecipe} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            No meal history yet. Generate your first meal to get started!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateMeal;