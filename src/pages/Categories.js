import React, { useState, useEffect } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory as deleteCategoryApi
} from '../services/categoryService';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active'
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function fetchCategories() {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setMessage('Failed to fetch categories');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  const handleAddCategory = async () => {
    if (formData.name.trim()) {
      setLoading(true);
      try {
        // Map status to is_active boolean
        const payload = {
          ...formData,
          is_active: formData.status === 'Active',
        };
        await createCategory(payload);
        fetchCategories();
      setFormData({ name: '', description: '', status: 'Active' });
      setShowAddModal(false);
        setMessage('Category added successfully!');
        setMessageType('success');
      } catch (err) {
        let msg = 'Failed to add category';
        if (err && err.message) {
          try {
            const parsed = JSON.parse(err.message);
            if (parsed && parsed.error) msg = parsed.error;
          } catch {}
        }
        setMessage(msg);
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditCategory = async () => {
    if (editingCategory && formData.name.trim()) {
      setLoading(true);
      try {
        const payload = {
          ...formData,
          is_active: formData.status === 'Active',
        };
        await updateCategory(editingCategory.id, payload);
        fetchCategories();
      setEditingCategory(null);
      setFormData({ name: '', description: '', status: 'Active' });
        setMessage('Category updated successfully!');
        setMessageType('success');
      } catch (err) {
        let msg = 'Failed to update category';
        if (err && err.message) {
          try {
            const parsed = JSON.parse(err.message);
            if (parsed && parsed.error) msg = parsed.error;
          } catch {}
        }
        setMessage(msg);
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setLoading(true);
      try {
        await deleteCategoryApi(id);
        fetchCategories();
        setMessage('Category deleted successfully!');
        setMessageType('success');
      } catch (err) {
        let msg = 'Failed to delete category';
        if (err && err.message) {
          try {
            const parsed = JSON.parse(err.message);
            if (parsed && parsed.error) msg = parsed.error;
          } catch {}
        }
        setMessage(msg);
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      status: category.is_active ? 'Active' : 'Inactive'
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', status: 'Active' });
  };

  // Example AI reorder alerts data
  const reorderAlerts = [
    {
      name: 'Lavender Dreams Perfume',
      current: 3,
      reorder: 52
    },
    {
      name: 'Rose Gold Luxury Watch',
      current: 5,
      reorder: 16
    }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen space-y-4 sm:space-y-6">
      {/* Feedback Message */}
      {message && (
        <div className={`mb-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Categories Management</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>➕</span>
            Add Category
          </button>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your product categories to organize your inventory effectively.
        </p>
      </div>

      {/* AI Reorder Alerts Panel */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mb-4">
        <div className="flex items-center mb-2">
          <span className="text-red-500 text-xl mr-2">⚠️</span>
          <span className="font-semibold text-red-700 text-base">AI Reorder Alerts</span>
        </div>
        <div className="text-red-700 text-sm mb-3">
          {reorderAlerts.length} products need immediate reordering based on AI demand forecasting.
        </div>
        <div className="space-y-3">
          {reorderAlerts.map((alert, idx) => (
            <div key={idx} className="bg-white border border-red-200 rounded-lg p-3">
              <div className="font-semibold text-gray-800">{alert.name}</div>
              <div className="text-gray-600 text-xs">Current: {alert.current} units</div>
              <div className="text-red-600 text-xs font-medium">Reorder: {alert.reorder} units</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories List - Table for sm+ */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full">
        <div className="overflow-x-auto hidden sm:block">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3 px-3 font-semibold">Category Name</th>
                <th className="py-3 px-3 font-semibold">Description</th>
                <th className="py-3 px-3 font-semibold">Products</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium">{category.name}</td>
                  <td className="py-3 px-3 text-gray-600">{category.description}</td>
                  <td className="py-3 px-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {category.productCount} items
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      category.is_active
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Card layout for mobile */}
        <div className="block sm:hidden space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-xl p-4 shadow-sm bg-white">
              <div className="font-semibold text-lg text-gray-800 mb-1">{category.name}</div>
              <div className="text-gray-600 text-sm mb-2">{category.description}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {category.productCount} items
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  category.is_active
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="flex-1 bg-blue-100 text-blue-700 py-1 rounded-lg font-medium text-xs hover:bg-blue-200 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="flex-1 bg-red-100 text-red-700 py-1 rounded-lg font-medium text-xs hover:bg-red-200 transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingCategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Enter category description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={editingCategory ? handleEditCategory : handleAddCategory}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition"
              >
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;