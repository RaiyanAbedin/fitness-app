import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MealDisplay from './MealDisplay';


import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUp, AlertTriangle } from 'lucide-react';

import { 
    ArrowLeft,
    Clock,
    Utensils,
    Apple,
    Search,
    Flame
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back to Dashboard Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800/70 text-white rounded backdrop-blur-sm border border-gray-700 hover:border-[#0ff]/50"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                
                {/* Meal Generator Form */}
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-gray-700">
                    <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                        <Utensils className="w-6 h-6 text-[#0ff]" />
                        Generate Meal Plan
                    </h1>

                    {/* Health & Safety Disclosure */}
    <Disclosure as="div" className="mb-6">
        {({ open }) => (
            <>
                <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-700/50 px-4 py-2 text-left text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring focus-visible:ring-[#0ff] focus-visible:ring-opacity-75 border border-gray-600">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-[#f0f]" />
                        <span>Important Health & Safety Information</span>
                    </div>
                    <ChevronUp
                        className={`${
                            open ? 'rotate-180 transform' : ''
                        } h-5 w-5 text-[#0ff]`}
                    />
                </Disclosure.Button>
                <Transition
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                >
                    <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-300 bg-gray-700/30 rounded-b-lg border-x border-b border-gray-600">
                        <p className="mb-2">
                            <strong className="text-[#0ff]">Medical Disclaimer:</strong> NuroFit's Nutrition Hub is designed for general meal and health purposes only and is not a substitute for a dietitian, diagnosis, or treatment.
                        </p>
                        <p className="mb-2">
                            Always consult with a qualified healthcare provider before consuming or following a meal plan, especially if you have any medical conditions, allergies, or health concerns.
                        </p>
                        <p>
                            By using NuroFit's meal generation features, you acknowledge that you are responsible for your own health and well-being. Use this information at your own risk and discretion.
                        </p>
                    </Disclosure.Panel>
                </Transition>
            </>
        )}
    </Disclosure>




                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Meal Type</label>
                            <select
                                value={mealType}
                                onChange={(e) => setMealType(e.target.value)}
                                className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                required
                            >
                                <option value="">Select Meal Type</option>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snack">Snack</option>
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">What would you like to eat?</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    value={mealRequest}
                                    onChange={(e) => setMealRequest(e.target.value)}
                                    placeholder="E.g., pasta, salad, chicken curry, etc."
                                    className="pl-10 w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300 flex items-center gap-1">
                                <Flame className="w-4 h-4 text-[#0ff]" /> Target Calories (optional)
                            </label>
                            <input
                                type="number"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                                placeholder="E.g., 500"
                                className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                min="1"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#0ff] to-[#f0f] text-black font-bold px-6 py-3 rounded hover:opacity-90 flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Utensils className="w-5 h-5" /> Generate Meal
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded">
                            {error}
                        </div>
                    )}
                </div>

                {/* Generated Meal Display */}
                {meal && (
                    <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-white">Your Generated Meal</h2>
                        <MealDisplay mealData={meal} saveRecipe={saveRecipe} />
                    </div>
                )}

                {/* Saved Meals Display */}
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-white">Meal History</h2>
                    {savedMeals.length > 0 ? (
                        <div className="space-y-6">
                            {savedMeals.map((log, index) => (
                                <div key={index} className="bg-gray-700/50 p-4 rounded border border-gray-600">
                                    <div className="flex flex-wrap justify-between mb-3">
                                        <span className="font-medium text-[#0ff]">
                                            {new Date(log.date).toLocaleDateString()} - {log.meal_type}
                                        </span>
                                        <span className="text-gray-400 flex items-center gap-1">
                                            <Clock className="w-4 h-4" /> Generated Meal
                                        </span>
                                    </div>
                                    <MealDisplay mealData={log.meal_details} saveRecipe={saveRecipe} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-4">
                            No meal history yet. Generate your first meal to get started!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateMeal;