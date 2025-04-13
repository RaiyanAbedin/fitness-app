import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Utensils, ShoppingBag } from 'lucide-react';

const SavedRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSavedRecipes();
    }, []);

    const fetchSavedRecipes = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setError('User not logged in.');
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://127.0.0.1:5000/api/saved-recipes/${userId}`);
            setRecipes(response.data.recipes || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching saved recipes:', err);
            setError('Failed to fetch saved recipes.');
            setLoading(false);
        }
    };

    const addIngredientsToShoppingList = async (recipe) => {
        try {
            const userId = localStorage.getItem("user_id");
            if (!userId) return;
    
            const response = await axios.post("http://127.0.0.1:5000/api/shopping-list/from-recipe", {
                user_id: userId,
                ingredients: recipe.ingredients
            });
    
            if (response.status === 201) {
                alert("Ingredients added to shopping list!");
            }
        } catch (err) {
            console.error("Error adding ingredients to shopping list:", err);
        }
    };

    if (loading) return <div className="text-center p-6">Loading saved recipes...</div>;

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
                
                
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Utensils className="w-6 h-6 text-green-500" />
                    Saved Recipes
                </h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {recipes.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-gray-500 text-center py-4">
                            You haven't saved any recipes yet. Generate a meal and save recipes you like!
                        </p>
                        <button
                            onClick={() => navigate('/nutrition')}
                            className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Generate Meals
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {recipes.map((recipe, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold text-green-700 mb-3">{recipe.recipe_name}</h2>
                                
                                {/* Nutrition Information */}
                                {recipe.nutrition && (
                                    <div className="mb-4 bg-green-50 p-4 rounded-lg grid grid-cols-4 gap-2">
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600">Calories</div>
                                            <div className="font-semibold">{recipe.nutrition.calories}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600">Protein</div>
                                            <div className="font-semibold">{recipe.nutrition.protein}g</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600">Carbs</div>
                                            <div className="font-semibold">{recipe.nutrition.carbs}g</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600">Fat</div>
                                            <div className="font-semibold">{recipe.nutrition.fat}g</div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Ingredients */}
                                <div className="mb-4">
                                    <h3 className="font-medium mb-2">Ingredients</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {recipe.ingredients.map((ingredient, i) => (
                                            <li key={i} className="text-gray-600">{ingredient}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* Instructions */}
                                <div className="mb-4">
                                    <h3 className="font-medium mb-2">Instructions</h3>
                                    <p className="text-gray-600">{recipe.instructions}</p>
                                </div>
                                
                                {/* Date Saved */}
                                <div className="text-sm text-gray-500 mt-4">
                                    Saved on: {new Date(recipe.date_saved).toLocaleDateString()}
                                </div>
                                
                                {/* Add to Shopping List Button */}
                                <button 
                                    onClick={() => addIngredientsToShoppingList(recipe)}
                                    className="mt-4 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    <ShoppingBag className="w-4 h-4" /> Add to Shopping List
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedRecipes;