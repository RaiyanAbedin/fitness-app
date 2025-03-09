import React, { useState, useEffect } from "react";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemType = "WORKOUT";

const WorkoutPlanner = () => {
    const [workoutBank, setWorkoutBank] = useState([]); // Left side: Saved workouts
    const [customPlan, setCustomPlan] = useState([]);   // Right side: Drop Zone (Now starts empty)
    const [savedPlans, setSavedPlans] = useState([]);   // Stores all saved plans
    const [selectedPlan, setSelectedPlan] = useState(""); // Tracks selected plan
    const [editMode, setEditMode] = useState(false);    // Track if we're editing an existing plan
    const [editingPlanName, setEditingPlanName] = useState(""); // Store the name of the plan being edited

    useEffect(() => {
        fetchWorkoutBank();
        fetchSavedPlans();
    }, []);

    const fetchWorkoutBank = async () => {
        try {
            const userId = localStorage.getItem("user_id");
            const response = await axios.get(`http://127.0.0.1:5000/api/workout-bank/${userId}`);
            if (response.data.exercises) {
                setWorkoutBank(response.data.exercises);
            }
        } catch (err) {
            console.error("Error fetching workout bank:", err);
        }
    };

    const fetchSavedPlans = async () => {
        try {
            const userId = localStorage.getItem("user_id");
            if (!userId) return;

            const response = await axios.get(`http://127.0.0.1:5000/api/workout-plans/${userId}`);
            if (response.data.plans) {
                setSavedPlans(response.data.plans);
            }
        } catch (err) {
            console.error("Error fetching saved plans:", err);
        }
    };

    const handlePlanChange = (event) => {
        const selectedPlanName = event.target.value;
        setSelectedPlan(selectedPlanName);
        // Reset edit mode when selecting a different plan
        setEditMode(false);
    };

    const loadPlanForEditing = () => {
        if (!selectedPlan) {
            alert("Please select a plan to edit");
            return;
        }

        const planToEdit = savedPlans.find((plan) => plan.plan_name === selectedPlan);
        if (planToEdit) {
            setCustomPlan(planToEdit.exercises);
            setEditMode(true);
            setEditingPlanName(selectedPlan);
        }
    };

    const cancelEditing = () => {
        setEditMode(false);
        setCustomPlan([]);
        setEditingPlanName("");
    };

    const saveCustomPlan = async () => {
        try {
            const userId = localStorage.getItem("user_id");
            if (!userId) {
                alert("User not logged in.");
                return;
            }

            let planName;
            
            if (editMode) {
                planName = editingPlanName;
            } else {
                planName = prompt("Enter a name for your workout plan:");
                if (!planName) {
                    alert("Workout plan name is required.");
                    return;
                }
            }

            const endpoint = editMode 
                ? "http://127.0.0.1:5000/api/update-workout-plan" 
                : "http://127.0.0.1:5000/api/save-workout-plan";
            
                const response = await axios[editMode ? "put" : "post"](endpoint, {    //issue: in front end i was making POST request, but backend route was expecting PUT, thus plans would not edit!
                user_id: userId,
                plan_name: planName,
                exercises: customPlan
            });

            if (response.status === 200 || response.status === 201) {
                alert(editMode ? "Workout plan updated successfully!" : "Workout plan saved successfully!");
                fetchSavedPlans(); // Reload plans after saving
                setCustomPlan([]); // Clear the drop zone
                setEditMode(false); // Exit edit mode
                setEditingPlanName(""); // Clear editing plan name
            }
        } catch (err) {
            console.error("Error saving workout plan:", err);
            alert("Failed to save workout plan.");
        }
    };

    const addToCustomPlan = (exercise) => {
        setCustomPlan((prevPlan) => [...prevPlan, exercise]);
    };

    const updateWorkoutPlan = async () => {
        if (!selectedPlan) {
            alert("Please select a workout plan to update.");
            return;
        }
    
        const planToUpdate = savedPlans.find((plan) => plan.plan_name === selectedPlan);
    
        if (!planToUpdate) {
            alert("Plan not found.");
            return;
        }
    
        try {
            const userId = localStorage.getItem("user_id");
    
            const response = await axios.put("http://127.0.0.1:5000/api/update-workout-plan", {
                user_id: userId,
                plan_name: planToUpdate.plan_name,
                exercises: customPlan.length > 0 ? customPlan : planToUpdate.exercises, // ✅ Fix: Use either customPlan or saved plan exercises
            });
    
            if (response.status === 200) {
                alert("Workout plan updated successfully!");
                fetchSavedPlans(); // Refresh saved plans after updating
            }
        } catch (err) {
            console.error("Error updating workout plan:", err);
            alert("Failed to update workout plan.");
        }
    };
    

    const removeWorkout = (index) => {
        setCustomPlan((prevPlan) => prevPlan.filter((_, i) => i !== index));
    };

    const deletePlan = async () => {
        if (!selectedPlan) {
            alert("Please select a plan to delete");
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete the plan "${selectedPlan}"?`);
if (!confirmDelete) {
    return;
}


        try {
            const userId = localStorage.getItem("user_id");
            const response = await axios.delete(`http://127.0.0.1:5000/api/delete-workout-plan`, {
                data: {
                    user_id: userId,
                    plan_name: selectedPlan
                }
            });

            if (response.status === 200) {
                alert("Workout plan deleted successfully!");
                fetchSavedPlans();
                setSelectedPlan("");
                
                // If we were editing this plan, clear the editing state
                if (editMode && editingPlanName === selectedPlan) {
                    setEditMode(false);
                    setCustomPlan([]);
                    setEditingPlanName("");
                }
            }
        } catch (err) {
            console.error("Error deleting workout plan:", err);
            alert("Failed to delete workout plan.");
        }
    };

    // ✅ Drag Source Component
    const WorkoutCard = ({ exercise }) => {
        const [{ isDragging }, drag] = useDrag(() => ({
            type: ItemType,
            item: exercise,
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }));

        return (
            <div
                ref={drag}
                className={`p-4 border rounded-lg bg-gray-50 shadow-sm cursor-grab ${isDragging ? "opacity-50" : ""}`}
            >
                <h3 className="text-lg font-bold">{exercise.exercise_name}</h3>
                <p className="text-gray-600">Sets: {exercise.sets} | Reps: {exercise.reps}</p>
            </div>
        );
    };

    // ✅ Drop Target Component
    const DropZone = () => {
        const [{ isOver }, drop] = useDrop(() => ({
            accept: ItemType,
            drop: (item) => addToCustomPlan(item),
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        }));

        return (
            <div
                ref={drop}
                className={`p-6 border-dashed border-2 rounded-lg min-h-[500px] ${isOver ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            >
                {customPlan.length > 0 ? (
                    customPlan.map((exercise, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-blue-50 shadow-sm flex justify-between items-center mb-2">
                            <div>
                                <h3 className="text-lg font-bold">{exercise.exercise_name}</h3>
                                <p className="text-gray-600">Sets: {exercise.sets} | Reps: {exercise.reps}</p>
                            </div>
                            <button
                                onClick={() => removeWorkout(index)}
                                className="ml-4 text-red-500 hover:text-red-700"
                            >
                                ❌
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">
                        {editMode 
                            ? "Edit your plan by adding or removing exercises." 
                            : "Drag workouts here to build your plan."}
                    </p>
                )}
            </div>
        );
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-6xl mx-auto grid grid-cols-2 gap-6">
                    {/* Left Column - Workout Bank */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Workout Bank</h2>
                        <div className="space-y-4">
                            {workoutBank.length > 0 ? (
                                workoutBank.map((exercise, index) => (
                                    <WorkoutCard key={index} exercise={exercise} />
                                ))
                            ) : (
                                <p className="text-gray-500">No saved workouts yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Custom Workout Plan */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">
                            {editMode ? `Editing: ${editingPlanName}` : "Custom Workout Plan"}
                        </h2>

                        {/* Drop Zone */}
                        <DropZone />

                        {/* Save/Update Plan Button */}
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={saveCustomPlan}
                                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                {editMode ? "Update Plan" : "Save Plan"}
                            </button>
                            
                            {editMode && (
                                <button
                                    onClick={cancelEditing}
                                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Saved Workout Plans Section */}
                <div className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Your Saved Workout Plans</h2>
                    {savedPlans.length > 0 ? (
                        <div className="mb-4">
                            <select
                                value={selectedPlan}
                                onChange={handlePlanChange}
                                className="w-full p-2 border rounded mb-4"
                            >
                                <option value="">Select a Plan</option>
                                {savedPlans.map((plan, index) => (
                                    <option key={index} value={plan.plan_name}>
                                        {plan.plan_name}
                                    </option>
                                ))}
                            </select>
                            
                            {/* Add action buttons for selected plan */}
                            {selectedPlan && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={loadPlanForEditing}
                                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        disabled={editMode}
                                    >
                                        Edit Plan
                                    </button>
                                    <button
                                        onClick={deletePlan}
                                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Delete Plan
                                    </button>
                                    
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500">No saved plans yet.</p>
                    )}

                    {/* Display selected plan details */}
                    {selectedPlan && (
                        <div className="space-y-4 mt-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Plan Details</h3>
                            {savedPlans
                                .find((plan) => plan.plan_name === selectedPlan)
                                ?.exercises.map((exercise, index) => (
                                    <div key={index} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                                        <h3 className="text-lg font-bold">{exercise.exercise_name}</h3>
                                        <p className="text-gray-600">Sets: {exercise.sets} | Reps: {exercise.reps}</p>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </DndProvider>
    );
};

export default WorkoutPlanner;