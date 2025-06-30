import React, { useState, useEffect } from 'react';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../services/customerService';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    city: '',
    total_purchases: 0,
    total_spent: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Fetch all customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      setMessage('Failed to fetch customers');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (formData.first_name && formData.last_name && formData.email) {
      setLoading(true);
      try {
        const { customer_code, ...payload } = formData;
        await createCustomer(payload);
        setMessage('Customer added successfully!');
        setMessageType('success');
        fetchCustomers();
        setFormData({ first_name: '', last_name: '', email: '', phone: '', gender: '', city: '', total_purchases: 0, total_spent: 0, is_active: true });
        setShowAddModal(false);
      } catch (err) {
        setMessage('Failed to add customer');
        setMessageType('error');
      } finally {
        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleEditCustomer = async () => {
    if (editingCustomer && formData.first_name && formData.last_name && formData.email) {
      setLoading(true);
      try {
        const { customer_code, ...payload } = formData;
        await updateCustomer(editingCustomer.id, payload);
        setMessage('Customer updated successfully!');
        setMessageType('success');
        fetchCustomers();
        setEditingCustomer(null);
        setFormData({ first_name: '', last_name: '', email: '', phone: '', gender: '', city: '', total_purchases: 0, total_spent: 0, is_active: true });
      } catch (err) {
        setMessage('Failed to update customer');
        setMessageType('error');
      } finally {
        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setLoading(true);
      try {
        await deleteCustomer(id);
        setMessage('Customer deleted successfully!');
        setMessageType('success');
        fetchCustomers();
      } catch (err) {
        setMessage('Failed to delete customer');
        setMessageType('error');
      } finally {
        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    const { customer_code, ...rest } = customer;
    setFormData({ ...rest });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingCustomer(null);
    setFormData({ first_name: '', last_name: '', email: '', phone: '', gender: '', city: '', total_purchases: 0, total_spent: 0, is_active: true });
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Customers Management</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>➕</span>
            Add Customer
          </button>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your customers and their information.
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

      {/* Customers List - Table for sm+ */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
        <div className="overflow-x-auto hidden sm:block">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3 px-3 font-semibold">Code</th>
                <th className="py-3 px-3 font-semibold">First Name</th>
                <th className="py-3 px-3 font-semibold">Last Name</th>
                <th className="py-3 px-3 font-semibold">Email</th>
                <th className="py-3 px-3 font-semibold">Phone</th>
                <th className="py-3 px-3 font-semibold">Gender</th>
                <th className="py-3 px-3 font-semibold">City</th>
                <th className="py-3 px-3 font-semibold">Purchases</th>
                <th className="py-3 px-3 font-semibold">Spent</th>
                <th className="py-3 px-3 font-semibold">Active</th>
                <th className="py-3 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium">{customer.customer_code}</td>
                  <td className="py-3 px-3">{customer.first_name}</td>
                  <td className="py-3 px-3">{customer.last_name}</td>
                  <td className="py-3 px-3">{customer.email}</td>
                  <td className="py-3 px-3">{customer.phone}</td>
                  <td className="py-3 px-3">{customer.gender}</td>
                  <td className="py-3 px-3">{customer.city}</td>
                  <td className="py-3 px-3">{customer.total_purchases}</td>
                  <td className="py-3 px-3">${Number(customer.total_spent).toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${customer.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{customer.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(customer)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
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
        )}
        {/* Card layout for mobile */}
        <div className="block sm:hidden space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="border rounded-xl p-4 shadow-sm bg-white">
              <div className="font-semibold text-lg text-gray-800 mb-1">{customer.first_name} {customer.last_name}</div>
              <div className="text-gray-600 text-sm mb-1">Code: {customer.customer_code}</div>
              <div className="text-gray-600 text-sm mb-1">Email: {customer.email}</div>
              <div className="text-gray-600 text-sm mb-1">Phone: {customer.phone}</div>
              <div className="text-gray-600 text-sm mb-1">Gender: {customer.gender}</div>
              <div className="text-gray-600 text-sm mb-1">City: {customer.city}</div>
              <div className="text-gray-600 text-sm mb-1">Purchases: {customer.total_purchases}</div>
              <div className="text-gray-600 text-sm mb-1">Spent: ${Number(customer.total_spent).toFixed(2)}</div>
              <div className="mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${customer.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{customer.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => openEditModal(customer)}
                  className="flex-1 bg-blue-100 text-blue-700 py-1 rounded-lg font-medium text-xs hover:bg-blue-200 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteCustomer(customer.id)}
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
      {(showAddModal || editingCustomer) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <div className="space-y-4">
              <div>
                {/* Customer Code is generated by backend and not part of the form */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Purchases
                </label>
                <input
                  type="number"
                  value={formData.total_purchases}
                  onChange={(e) => setFormData({...formData, total_purchases: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Spent
                </label>
                <input
                  type="number"
                  value={formData.total_spent}
                  onChange={(e) => setFormData({...formData, total_spent: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  id="is_active"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={editingCustomer ? handleEditCustomer : handleAddCustomer}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition"
                disabled={loading}
              >
                {editingCustomer ? 'Update Customer' : 'Add Customer'}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition"
                disabled={loading}
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

export default Customers; 