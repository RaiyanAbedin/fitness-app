import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Clipboard, 
  Dumbbell, 
  ChevronUp, 
  Info, 
  Play, 
  Save, 
  Trash, 
  Edit, 
  Plus,
  Target,
  Activity,
  Clock
} from 'lucide-react';
import { Dialog, Disclosure, Tab, Transition } from '@headlessui/react';

// Import the new component
import ExerciseLibrary from './ExerciseLibrary';

const ItemType = "WORKOUT";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const WorkoutPlanner = () => {
    const [workoutBank, setWorkoutBank] = useState([]); // Left side: Saved workouts
    const [customPlan, setCustomPlan] = useState([]);   // Right side: Drop Zone for custom plan
    const [savedPlans, setSavedPlans] = useState([]);   // Stores all saved plans
    const [selectedPlan, setSelectedPlan] = useState(""); // Tracks selected plan
    const [editMode, setEditMode] = useState(false);    // Track if we're editing an existing plan
    const [editingPlanName, setEditingPlanName] = useState(""); // Store the name of the plan being edited
    const [exerciseDetails, setExerciseDetails] = useState(null); // For exercise details dialog
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [planToViewDetails, setPlanToViewDetails] = useState(null);
    const [isPlanDetailsOpen, setIsPlanDetailsOpen] = useState(false);
    const [exerciseLibrary, setExerciseLibrary] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorkoutBank();
        fetchSavedPlans();
        fetchExerciseLibrary();
    }, []);

    const fetchExerciseLibrary = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/exercise-library');
            if (response.data.exercises) {
                setExerciseLibrary(response.data.exercises);
            }
        } catch (err) {
            console.error("Error fetching exercise library:", err);
        }
    };

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
            
            const response = await axios[editMode ? "put" : "post"](endpoint, {
                user_id: userId,
                plan_name: planName,
                exercises: customPlan
            });

            if (response.status === 200 || response.status === 201) {
                alert(editMode ? "Workout plan updated successfully!" : "Workout plan saved successfully!");
                fetchSavedPlans();
                setCustomPlan([]);
                setEditMode(false);
                setEditingPlanName("");
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
                exercises: customPlan.length > 0 ? customPlan : planToUpdate.exercises,
            });
    
            if (response.status === 200) {
                alert("Workout plan updated successfully!");
                fetchSavedPlans();
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

    const openExerciseDetails = (exercise) => {
        // Find complete exercise details from library if available
        const fullExerciseDetails = exerciseLibrary.find(ex => ex.name === exercise.exercise_name);
        
        if (fullExerciseDetails) {
            setExerciseDetails({
                ...fullExerciseDetails,
                sets: exercise.sets,
                reps: exercise.reps
            });
        } else {
            // If not found in library, use basic info
            setExerciseDetails({
                name: exercise.exercise_name,
                sets: exercise.sets,
                reps: exercise.reps,
                muscles_targeted: ["Unknown"],
                instructions: "No detailed instructions available for this exercise.",
                difficulty: "Unknown"
            });
        }
        
        setIsDetailsOpen(true);
    };

    const viewPlanDetails = (plan) => {
        setPlanToViewDetails(plan);
        setIsPlanDetailsOpen(true);
    };

    // Drag Source Component
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
                className={`p-4 border rounded-lg bg-gray-700/50 shadow-sm cursor-grab ${isDragging ? "opacity-50" : ""} mb-3 border-gray-600 hover:border-[#0ff]/50 transition-all`}
            >
                <h3 className="text-lg font-bold text-white">{exercise.exercise_name}</h3>
                <p className="text-gray-300">Sets: {exercise.sets} | Reps: {exercise.reps}</p>
            </div>
        );
    };

    // Drop Target Component
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
                className={`p-6 border-dashed border-2 rounded-lg min-h-[500px] ${isOver ? "border-[#0ff] bg-gray-700/30" : "border-gray-600"} overflow-y-auto`}
            >
                {customPlan.length > 0 ? (
                    customPlan.map((exercise, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-700/50 shadow-sm flex justify-between items-center mb-2 border-gray-600">
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold text-[#0ff]">{exercise.exercise_name}</h3>
                                <p className="text-gray-300">Sets: {exercise.sets} | Reps: {exercise.reps}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openExerciseDetails(exercise)}
                                    className="p-2 text-gray-300 hover:text-[#0ff] bg-gray-800/50 rounded-full"
                                    title="View details"
                                >
                                    <Info className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => removeWorkout(index)}
                                    className="p-2 text-gray-300 hover:text-red-400 bg-gray-800/50 rounded-full"
                                    title="Remove"
                                >
                                    <Trash className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center mt-10">
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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
                <div className="max-w-6xl mx-auto mb-4">
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800/70 text-white rounded backdrop-blur-sm border border-gray-700 hover:border-[#0ff]/50"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    
                    <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[#0ff]" />
                        Workout Planner
                    </h1>
                </div>
                
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Left Column - Workout Bank */}
                    <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                            <Dumbbell className="w-5 h-5 text-[#0ff]" /> Workout Bank
                        </h2>
                        
                        {/* Tabbed interface for workout bank */}
                        <Tab.Group>
                            <Tab.List className="flex space-x-1 rounded-xl bg-gray-700/50 p-1 mb-4">
                                <Tab
                                    className={({ selected }) =>
                                        classNames(
                                            'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                            'focus:outline-none',
                                            selected
                                                ? 'bg-gradient-to-r from-[#0ff]/80 to-[#f0f]/80 text-white shadow'
                                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                        )
                                    }
                                >
                                    Your Saved Exercises
                                </Tab>
                            </Tab.List>
                            <Tab.Panels>
                                <Tab.Panel className="h-[500px] overflow-y-auto pr-2 bg-gray-700/30 rounded-lg p-2">
                                    {workoutBank.length > 0 ? (
                                        workoutBank.map((exercise, index) => (
                                            <WorkoutCard key={index} exercise={exercise} />
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-center py-8">
                                            No saved workouts yet. Save exercises from the AI Coach or Exercise Library.
                                        </p>
                                    )}
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>

                    {/* Right Column - Custom Workout Plan */}
                    <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                            {editMode ? (
                                <>
                                    <Edit className="w-5 h-5 text-[#f0f]" /> Editing: {editingPlanName}
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5 text-[#0ff]" /> Custom Workout Plan
                                </>
                            )}
                        </h2>

                        {/* Drop Zone */}
                        <DropZone />

                        {/* Save/Update Plan Button */}
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={saveCustomPlan}
                                className="flex-1 bg-gradient-to-r from-[#0ff] to-[#f0f] text-black font-bold px-4 py-2 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                disabled={customPlan.length === 0}
                            >
                                <Save className="w-4 h-4" />
                                {editMode ? "Update Plan" : "Save Plan"}
                            </button>
                            
                            {editMode && (
                                <button
                                    onClick={cancelEditing}
                                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Exercise Library component */}
                <div className="max-w-6xl mx-auto mb-6">
                    <ExerciseLibrary onAddToCustomPlan={addToCustomPlan} />
                </div>

                {/* Saved Workout Plans Section */}
                <div className="max-w-6xl mx-auto bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                        <Clipboard className="w-5 h-5 text-[#0ff]" /> Your Saved Workout Plans
                    </h2>
                    
                    {savedPlans.length > 0 ? (
                        <div className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Select a Plan</label>
                                    <select
                                        value={selectedPlan}
                                        onChange={handlePlanChange}
                                        className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                    >
                                        <option value="">Select a Plan</option>
                                        {savedPlans.map((plan, index) => (
                                            <option key={index} value={plan.plan_name}>
                                                {plan.plan_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Add action buttons for selected plan */}
                                {selectedPlan && (
                                    <div className="flex flex-col justify-end gap-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={loadPlanForEditing}
                                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                disabled={editMode}
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit Plan
                                            </button>
                                            <button
                                                onClick={deletePlan}
                                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2"
                                            >
                                                <Trash className="w-4 h-4" />
                                                Delete Plan
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Display selected plan details with collapsible sections */}
                            {selectedPlan && (
                                <div className="space-y-4 mt-4 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                    <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2 flex items-center justify-between">
                                        <span>Plan Details: {selectedPlan}</span>
                                        <button 
                                            onClick={() => viewPlanDetails(
                                                savedPlans.find(plan => plan.plan_name === selectedPlan)
                                            )}
                                            className="text-[#0ff] hover:text-[#0ff]/80 text-sm flex items-center gap-1"
                                        >
                                            <Info className="w-4 h-4" /> View Full Details
                                        </button>
                                    </h3>
                                    
                                    <div className="space-y-3">
                                        {savedPlans
                                            .find((plan) => plan.plan_name === selectedPlan)
                                            ?.exercises.map((exercise, index) => (
                                                <Disclosure key={index} as="div">
                                                    {({ open }) => (
                                                        <>
                                                            <Disclosure.Button className="flex w-full justify-between items-center rounded-lg bg-gray-800 px-4 py-3 text-left text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring focus-visible:ring-[#0ff] border border-gray-600">
                                                                <div>
                                                                    <span className="text-[#0ff] mr-2">{index + 1}.</span> 
                                                                    <span className="font-bold">{exercise.exercise_name}</span>
                                                                    <span className="text-gray-400 ml-2">({exercise.sets} × {exercise.reps})</span>
                                                                </div>
                                                                <ChevronUp
                                                                    className={`${
                                                                        open ? 'rotate-180 transform' : ''
                                                                    } h-5 w-5 text-[#0ff]`}
                                                                />
                                                            </Disclosure.Button>
                                                            <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-300 bg-gray-800/50 rounded-b-lg border-x border-b border-gray-600">
                                                                {/* Find and display exercise details if available */}
                                                                {(() => {
                                                                    const details = exerciseLibrary.find(
                                                                        ex => ex.name === exercise.exercise_name
                                                                    );
                                                                    
                                                                    if (details) {
                                                                        return (
                                                                            <>
                                                                                <div className="mb-3">
                                                                                    <span className="text-[#f0f] font-semibold">Targets:</span>{" "}
                                                                                    {details.muscles_targeted.join(', ')}
                                                                                </div>
                                                                                <div className="mb-3">
                                                                                    <span className="text-[#f0f] font-semibold">Instructions:</span>{" "}
                                                                                    {details.instructions}
                                                                                </div>
                                                                                <div className="mb-3">
                                                                                    <span className="text-[#f0f] font-semibold">Difficulty:</span>{" "}
                                                                                    <span className="capitalize">{details.difficulty}</span>
                                                                                </div>
                                                                            </>
                                                                        );
                                                                    } else {
                                                                        return (
                                                                            <div className="text-gray-400 italic">
                                                                                No detailed information available for this exercise.
                                                                            </div>
                                                                        );
                                                                    }
                                                                })()}
                                                            </Disclosure.Panel>
                                                        </>
                                                    )}
                                                </Disclosure>
                                            ))}
                                    </div>
                                    
                                    <button
                                        onClick={() => navigate('/workout-tracker', { 
                                            state: { 
                                                plan: savedPlans.find(plan => plan.plan_name === selectedPlan) 
                                            } 
                                        })}
                                        className="w-full mt-4 bg-gradient-to-r from-[#0ff] to-[#f0f] text-black px-4 py-2 rounded hover:opacity-90 font-bold flex items-center justify-center gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        Start Workout with This Plan
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-4">
                            No saved plans yet. Create your first custom workout plan above.
                        </p>
                    )}
                </div>
                
                {/* Exercise Details Dialog */}
                <Transition appear show={isDetailsOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-10" onClose={() => setIsDetailsOpen(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/80" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-white"
                                        >
                                            Exercise Details
                                        </Dialog.Title>
                                        
                                        {exerciseDetails && (
                                            <div className="mt-4">
                                                <div className="bg-gradient-to-r from-[#0ff]/20 to-[#f0f]/20 rounded-lg p-1 mb-4">
                                                    <div className="bg-gray-900/80 p-4 rounded-lg">
                                                        <h4 className="text-xl font-bold text-[#0ff]">{exerciseDetails.name}</h4>
                                                        <p className="text-white mt-1">
                                                            {exerciseDetails.sets} sets × {exerciseDetails.reps} reps
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4 text-gray-300">
                                                    <div>
                                                        <h5 className="text-[#f0f] font-semibold mb-1">Muscles Targeted:</h5>
                                                        <p>{exerciseDetails.muscles_targeted.join(', ')}</p>
                                                    </div>
                                                    
                                                    <div>
                                                        <h5 className="text-[#f0f] font-semibold mb-1">Instructions:</h5>
                                                        <p>{exerciseDetails.instructions}</p>
                                                    </div>
                                                    
                                                    <div>
                                                        <h5 className="text-[#f0f] font-semibold mb-1">Difficulty:</h5>
                                                        <p className="capitalize">{exerciseDetails.difficulty}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-6">
                                            <button
                                                type="button"
                                                className="w-full inline-flex justify-center rounded-md bg-gradient-to-r from-[#0ff] to-[#f0f] px-4 py-2 text-sm font-medium text-black hover:opacity-90"
                                                onClick={() => setIsDetailsOpen(false)}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
                
                {/* Plan Details Dialog */}
                <Transition appear show={isPlanDetailsOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-10" onClose={() => setIsPlanDetailsOpen(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/80" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-white flex items-center gap-2"
                                        >
                                            <Clipboard className="w-5 h-5 text-[#0ff]" />
                                            Workout Plan Summary
                                        </Dialog.Title>
                                        
                                        {planToViewDetails && (
                                            <div className="mt-4">
                                                <div className="bg-gradient-to-r from-[#0ff]/20 to-[#f0f]/20 rounded-lg p-1 mb-4">
                                                    <div className="bg-gray-900/80 p-4 rounded-lg flex items-center justify-between">
                                                        <h4 className="text-xl font-bold text-[#0ff]">{planToViewDetails.plan_name}</h4>
                                                        <div className="flex items-center">
                                                            <span className="text-white bg-gray-700 rounded-full px-3 py-1 text-sm">
                                                                {planToViewDetails.exercises.length} exercises
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-4 rounded-lg bg-gray-700/40 mb-4">
                                                    <div className="grid grid-cols-3 gap-4 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Dumbbell className="w-4 h-4 text-[#0ff]" />
                                                            <div>
                                                                <div className="text-xs text-gray-400">Total Exercises</div>
                                                                <div className="font-semibold text-white">{planToViewDetails.exercises.length}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Activity className="w-4 h-4 text-[#0ff]" />
                                                            <div>
                                                                <div className="text-xs text-gray-400">Est. Intensity</div>
                                                                <div className="font-semibold text-white">
                                                                    {planToViewDetails.exercises.length <= 3 ? 'Low' : 
                                                                     planToViewDetails.exercises.length <= 6 ? 'Medium' : 'High'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-[#0ff]" />
                                                            <div>
                                                                <div className="text-xs text-gray-400">Est. Duration</div>
                                                                <div className="font-semibold text-white">
                                                                    {planToViewDetails.exercises.length * 5 + 10} min
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <h5 className="text-white text-lg font-medium mb-3">Exercise Sequence</h5>
                                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                                    {planToViewDetails.exercises.map((exercise, idx) => {
                                                        // Find detailed exercise info from library if available
                                                        const exerciseInfo = exerciseLibrary.find(
                                                            ex => ex.name === exercise.exercise_name
                                                        );
                                                        
                                                        return (
                                                            <Disclosure key={idx} as="div">
                                                                {({ open }) => (
                                                                    <>
                                                                        <Disclosure.Button className="flex w-full justify-between items-center rounded-lg bg-gray-700 px-4 py-3 text-left text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus-visible:ring focus-visible:ring-[#0ff] border border-gray-600">
                                                                            <div className="flex items-center">
                                                                                <span className="bg-gray-800 text-[#0ff] rounded-full w-6 h-6 flex items-center justify-center mr-3">
                                                                                    {idx+1}
                                                                                </span>
                                                                                <span className="font-semibold">{exercise.exercise_name}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="text-gray-300 text-xs bg-gray-800 px-2 py-1 rounded">
                                                                                    {exercise.sets} × {exercise.reps}
                                                                                </span>
                                                                                <ChevronUp
                                                                                    className={`${
                                                                                        open ? 'rotate-180 transform' : ''
                                                                                    } h-5 w-5 text-[#0ff]`}
                                                                                />
                                                                            </div>
                                                                        </Disclosure.Button>
                                                                        <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-300 bg-gray-800/40 rounded-b-lg border-x border-b border-gray-600">
                                                                            {exerciseInfo ? (
                                                                                <div className="space-y-3">
                                                                                    <div>
                                                                                        <span className="text-[#f0f] font-medium">Muscles:</span>{' '}
                                                                                        {exerciseInfo.muscles_targeted.join(', ')}
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-[#f0f] font-medium">Instructions:</span>{' '}
                                                                                        {exerciseInfo.instructions}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-6">
                                                                                        <div>
                                                                                            <span className="text-[#f0f] font-medium">Difficulty:</span>{' '}
                                                                                            <span className="capitalize">{exerciseInfo.difficulty}</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-[#f0f] font-medium">Your Plan:</span>{' '}
                                                                                            {exercise.sets} sets of {exercise.reps} reps
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-gray-400 italic">
                                                                                    No detailed information available for this exercise.
                                                                                </div>
                                                                            )}
                                                                        </Disclosure.Panel>
                                                                    </>
                                                                )}
                                                            </Disclosure>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-6 flex gap-2">
                                            <button
                                                type="button"
                                                className="flex-1 justify-center rounded-md bg-gradient-to-r from-[#0ff] to-[#f0f] px-4 py-2 text-sm font-medium text-black hover:opacity-90 flex items-center gap-2"
                                                onClick={() => {
                                                    navigate('/workout-tracker', { 
                                                        state: { plan: planToViewDetails } 
                                                    });
                                                    setIsPlanDetailsOpen(false);
                                                }}
                                            >
                                                <Play className="w-4 h-4" />
                                                Start Workout
                                            </button>
                                            <button
                                                type="button"
                                                className="flex-1 justify-center rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
                                                onClick={() => setIsPlanDetailsOpen(false)}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </DndProvider>
    );
};

export default WorkoutPlanner;