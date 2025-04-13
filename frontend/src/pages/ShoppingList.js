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

    if (loading) return <div className="text-center p-6">Loading shopping list...</div>;

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
                    <ShoppingBag className="w-6 h-6 text-blue-500" />
                    Shopping List
                </h1>

                {/* Add Item Form */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-lg font-semibold mb-4">Add Item</h2>
                    <form onSubmit={addItem} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Item Name</label>
                                <input
                                    type="text"
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    placeholder="Enter item name"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full p-2 border rounded"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Quantity</label>
                                <input
                                    type="text"
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(e.target.value)}
                                    placeholder="E.g., 2, 500g, 1 can"
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            <Plus className="w-4 h-4" /> Add to List
                        </button>
                    </form>
                    
                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                </div>

                {/* Shopping List */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Your Shopping List</h2>
                    
                    {shoppingList.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                            Your shopping list is empty. Add some items above.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedItems).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="text-md font-medium text-gray-700 mb-2 border-b pb-1">
                                        {category}
                                    </h3>
                                    <ul className="space-y-2">
                                        {items.map(item => (
                                            <li 
                                                key={item._id} 
                                                className={`flex items-center justify-between p-3 border rounded ${
                                                    item.purchased ? 'bg-gray-100' : 'bg-white'
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
                                                            className="p-1 border rounded"
                                                        />
                                                        <select
                                                            value={editingItem.category}
                                                            onChange={(e) => setEditingItem({
                                                                ...editingItem,
                                                                category: e.target.value
                                                            })}
                                                            className="p-1 border rounded"
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
                                                            className="p-1 border rounded"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className={`flex-1 ${item.purchased ? 'line-through text-gray-500' : ''}`}>
                                                        <span className="font-medium">{item.item_name}</span>
                                                        {item.quantity && item.quantity !== '1' && (
                                                            <span className="text-sm text-gray-600"> · {item.quantity}</span>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-2">
                                                    {editingItem && editingItem.id === item._id ? (
                                                        <>
                                                            <button
                                                                onClick={saveEdit}
                                                                className="p-1 text-green-600 hover:text-green-800"
                                                            >
                                                                <Check className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="p-1 text-red-600 hover:text-red-800"
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
                                                                        ? 'text-green-600 hover:text-green-800' 
                                                                        : 'text-gray-400 hover:text-green-600'
                                                                }`}
                                                            >
                                                                <Check className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => startEditing(item)}
                                                                className="p-1 text-blue-600 hover:text-blue-800"
                                                            >
                                                                <Edit className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteItem(item._id)}
                                                                className="p-1 text-red-600 hover:text-red-800"
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