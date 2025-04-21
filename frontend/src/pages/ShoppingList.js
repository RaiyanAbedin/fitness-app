import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Plus, Check, Trash, Edit } from 'lucide-react';

const ShoppingList = () => {
    const [shoppingList, setShoppingList] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [newCategory, setNewCategory] = useState('Other');
    const [newQuantity, setNewQuantity] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const navigate = useNavigate();

    // Categories for organizing shopping list
    const categories = [
        'Fruits', 
        'Vegetables', 
        'Meat', 
        'Dairy', 
        'Grains', 
        'Canned Goods',
        'Frozen Foods', 
        'Snacks', 
        'Beverages', 
        'Condiments',
        'Baking', 
        'Other'
    ];

    useEffect(() => {
        fetchShoppingList();
    }, []);

    const fetchShoppingList = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setError('User not logged in.');
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://127.0.0.1:5000/api/shopping-list/${userId}`); //sends a get request to /api/shopping-list-user id, the backend then returns all shopping items for the user logged in.
            setShoppingList(response.data.shopping_list || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching shopping list:', err);
            setError('Failed to fetch shopping list.');
            setLoading(false);
        }
    };

    const addItem = async (e) => {
        e.preventDefault();
        
        if (!newItem.trim()) {
            return;
        }
        
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setError('User not logged in.');
                return;
            }

            await axios.post('http://127.0.0.1:5000/api/shopping-list', { //post = add
                user_id: userId,
                item_name: newItem,
                category: newCategory,
                quantity: newQuantity || '1'
            });

            fetchShoppingList();
            setNewItem('');
            setNewCategory('Other');
            setNewQuantity('');
        } catch (err) {
            console.error('Error adding item:', err);
            setError('Failed to add item to shopping list.');
        }
    };

    const togglePurchased = async (itemId, currentStatus) => {
        try {
            await axios.put(`http://127.0.0.1:5000/api/shopping-list/${itemId}`, {
                purchased: !currentStatus
            });
            
            fetchShoppingList();
        } catch (err) {
            console.error('Error updating item:', err);
            setError('Failed to update item.');
        }
    };

    const deleteItem = async (itemId) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/api/shopping-list/${itemId}`); //delete = delete (obvs)
            fetchShoppingList();
        } catch (err) {
            console.error('Error deleting item:', err);
            setError('Failed to delete item.');
        }
    };

    const startEditing = (item) => {
        setEditingItem({
            id: item._id,
            name: item.item_name,
            category: item.category,
            quantity: item.quantity
        });
    };

    const saveEdit = async () => {
        if (!editingItem) return;
        
        try {
            await axios.put(`http://127.0.0.1:5000/api/shopping-list/${editingItem.id}`, { //put = update
                item_name: editingItem.name,
                category: editingItem.category,
                quantity: editingItem.quantity
            });
            
            fetchShoppingList();
            setEditingItem(null);
        } catch (err) {
            console.error('Error updating item:', err);
            setError('Failed to update item.');
        }
    };

    const cancelEdit = () => {
        setEditingItem(null);
    };

    // Group items by category
    const groupedItems = shoppingList.reduce((acc, item) => {
        const category = item.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
            <div className="text-[#0ff] text-xl animate-pulse">
                Loading shopping list...
            </div>
        </div>
    );

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
                
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                    <ShoppingBag className="w-6 h-6 text-[#0ff]" />
                    Shopping List
                </h1>

                {/* Add Item Form */}
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-white">Add Item</h2>
                    <form onSubmit={addItem} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-300">Item Name</label>
                                <input
                                    type="text"
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    placeholder="Enter item name"
                                    className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-300">Category</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-300">Quantity</label>
                                <input
                                    type="text"
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(e.target.value)}
                                    placeholder="E.g., 2, 500g, 1 can"
                                    className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-gradient-to-r from-[#0ff] to-[#f0f] text-black px-4 py-2 rounded hover:opacity-90 font-bold"
                        >
                            <Plus className="w-4 h-4" /> Add to List
                        </button>
                    </form>
                    
                    {error && (
                        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded">
                            {error}
                        </div>
                    )}
                </div>

                {/* Shopping List */}
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-white">Your Shopping List</h2>
                    
                    {shoppingList.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">
                            Your shopping list is empty. Add some items above.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedItems).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="text-md font-medium text-[#0ff] mb-2 border-b border-gray-700 pb-1">
                                        {category}
                                    </h3>
                                    <ul className="space-y-2">
                                        {items.map(item => (
                                            <li 
                                                key={item._id} 
                                                className={`flex items-center justify-between p-3 border rounded ${
                                                    item.purchased ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-700/70 border-gray-600'
                                                }`}
                                            >
                                                {editingItem && editingItem.id === item._id ? (
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                                        <input
                                                            type="text"
                                                            value={editingItem.name}
                                                            onChange={(e) => setEditingItem({
                                                                ...editingItem,
                                                                name: e.target.value
                                                            })}
                                                            className="p-1 bg-gray-800 border border-gray-600 rounded text-white"
                                                        />
                                                        <select
                                                            value={editingItem.category}
                                                            onChange={(e) => setEditingItem({
                                                                ...editingItem,
                                                                category: e.target.value
                                                            })}
                                                            className="p-1 bg-gray-800 border border-gray-600 rounded text-white"
                                                        >
                                                            {categories.map(category => (
                                                                <option key={category} value={category}>
                                                                    {category}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="text"
                                                            value={editingItem.quantity}
                                                            onChange={(e) => setEditingItem({
                                                                ...editingItem,
                                                                quantity: e.target.value
                                                            })}
                                                            className="p-1 bg-gray-800 border border-gray-600 rounded text-white"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className={`flex-1 ${item.purchased ? 'line-through text-gray-400' : 'text-white'}`}>
                                                        <span className="font-medium">{item.item_name}</span>
                                                        {item.quantity && item.quantity !== '1' && (
                                                            <span className="text-sm text-gray-400"> · {item.quantity}</span>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-2">
                                                    {editingItem && editingItem.id === item._id ? (
                                                        <>
                                                            <button
                                                                onClick={saveEdit}
                                                                className="p-1 text-[#0ff] hover:text-[#0ff]/80"
                                                            >
                                                                <Check className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="p-1 text-red-400 hover:text-red-300"
                                                            >
                                                                <Trash className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => togglePurchased(item._id, item.purchased)}
                                                                className={`p-1 ${
                                                                    item.purchased 
                                                                        ? 'text-green-400 hover:text-green-300' 
                                                                        : 'text-gray-500 hover:text-[#0ff]'
                                                                }`}
                                                            >
                                                                <Check className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => startEditing(item)}
                                                                className="p-1 text-blue-400 hover:text-blue-300"
                                                            >
                                                                <Edit className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteItem(item._id)}
                                                                className="p-1 text-red-400 hover:text-red-300"
                                                            >
                                                                <Trash className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShoppingList;