import React from 'react';
import axios from 'axios';
import { 
    Utensils,
    ListOrdered,
    ShoppingBag,
    Info,
    Heart,
    Save,
    Flame,
    Beef,
    Wheat,
    Droplet
} from 'lucide-react';

const MealDisplay = ({ mealData, saveRecipe, showSaveButton = true }) => {
    // Fix for malformed meal data from OpenAI
    // Sometimes the API returns markdown-formatted JSON (```json {...} ```)
    // or incomplete/truncated responses. This parsing function:
    // 1. Removes markdown code block markers
    // 2. Attempts to parse the clean JSON 
    // 3. Falls back to creating a structured object if parsing fails
    const parseMealData = (data) => {
        if (typeof data === 'string') {
            try {
                // Clean up markdown formatting and parse JSON
                const cleanedData = data.replace(/```json/g, "").replace(/```/g, "").trim();
                return JSON.parse(cleanedData);
            } catch (e) {
                console.error("❌ Failed to parse mealData:", e);
                return {
                    meal_type: "Unknown",
                    calories: 0,
                    dietary_preferences: [],
                    dishes: [{
                        name: "Data Error",
                        ingredients: ["Please regenerate meal"],
                        instructions: "There was an error parsing the meal data."
                    }]
                };
            }
        }
        return data;
    };

    const meal = parseMealData(mealData);

    if (!meal?.dishes) {
        return <div className="p-4 bg-red-50 text-red-500 rounded">Invalid meal data</div>;
    }


    const addIngredientsToShoppingList = async (dish) => {
        try {
            const userId = localStorage.getItem("user_id");
            if (!userId) return;
    
            const response = await axios.post("http://127.0.0.1:5000/api/shopping-list/from-recipe", {
                user_id: userId,
                ingredients: dish.ingredients
            });
    
            if (response.status === 201) {
                alert("Ingredients added to shopping list!");
            }
        } catch (err) {
            console.error("Error adding ingredients to shopping list:", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Meal Summary Card */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                    <Utensils className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">{meal.meal_type}</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5" />
                        <div>
                            <div className="text-sm opacity-80">Calories</div>
                            <div className="font-semibold">{meal.calories || "N/A"}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        <div>
                            <div className="text-sm opacity-80">Preferences</div>
                            <div className="font-semibold">{meal.dietary_preferences?.length ? meal.dietary_preferences.join(', ') : "None"}</div>
                        </div>
                    </div>
                    
                    {meal.meal_request && (
                        <div className="flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            <div>
                                <div className="text-sm opacity-80">Requested</div>
                                <div className="font-semibold">{meal.meal_request}</div>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                        <Utensils className="w-5 h-5" />
                        <div>
                            <div className="text-sm opacity-80">Dishes</div>
                            <div className="font-semibold">{meal.dishes.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dishes List */}
            <div className="space-y-6">
                {meal.dishes.map((dish, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-semibold text-green-700 mb-3">{dish.name}</h3>
                        
                        {/* Nutrition facts */}
                        {(dish.protein || dish.carbs || dish.fat) && (
                            <div className="mb-4 grid grid-cols-3 gap-4 bg-green-50 p-3 rounded-lg">
                                {dish.protein && (
                                    <div className="flex items-center gap-2">
                                        <Beef className="w-4 h-4 text-red-500" />
                                        <span>Protein: {dish.protein}g</span>
                                    </div>
                                )}
                                {dish.carbs && (
                                    <div className="flex items-center gap-2">
                                        <Wheat className="w-4 h-4 text-yellow-500" />
                                        <span>Carbs: {dish.carbs}g</span>
                                    </div>
                                )}
                                {dish.fat && (
                                    <div className="flex items-center gap-2">
                                        <Droplet className="w-4 h-4 text-blue-500" />
                                        <span>Fat: {dish.fat}g</span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Ingredients */}
                        <div className="mb-4">
                            <h4 className="flex items-center gap-2 font-medium mb-2 text-gray-700">
                                <ShoppingBag className="w-4 h-4 text-green-600" /> Ingredients
                            </h4>
                            <ul className="list-disc pl-5 space-y-1">
                                {dish.ingredients.map((ingredient, i) => (
                                    <li key={i} className="text-gray-600">{ingredient}</li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Instructions */}
                        <div className="mb-4">
                            <h4 className="flex items-center gap-2 font-medium mb-2 text-gray-700">
                                <ListOrdered className="w-4 h-4 text-green-600" /> Instructions
                            </h4>
                            <p className="text-gray-600">{dish.instructions}</p>
                        </div>
                        
                        {/* Save Button */}
                        {showSaveButton && (
    <div className="flex gap-2">
        <button 
            onClick={() => saveRecipe(dish)}
            className="mt-3 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
            <Save className="w-4 h-4" /> Save Recipe
        </button>
        <button 
            onClick={() => addIngredientsToShoppingList(dish)}
            className="mt-3 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
            <ShoppingBag className="w-4 h-4" /> Add to Shopping List
        </button>
    </div>

                            
                            
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MealDisplay;