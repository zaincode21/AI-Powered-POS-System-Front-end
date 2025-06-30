import React, { useState, useEffect } from 'react';
import {
  getStores,
  createStore,
  updateStore,
  deleteStore,
} from '../services/storeService';

function Store() {
  const [stores, setStores] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    tax_rate: '',
    currency: 'USD',
    timezone: 'UTC',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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

  // List of common IANA timezones
  const timezones = [
    'UTC', 'Africa/Cairo', 'Africa/Johannesburg', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/New_York', 'Asia/Bangkok', 'Asia/Dubai', 'Asia/Hong_Kong', 'Asia/Kolkata', 'Asia/Seoul',
    'Asia/Shanghai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'Europe/Berlin', 'Europe/Istanbul',
    'Europe/London', 'Europe/Moscow', 'Pacific/Auckland'
  ];

  // List of common ISO 4217 currency codes
  const currencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'ZAR',
    'BRL', 'RUB', 'SGD', 'HKD', 'KRW', 'NZD', 'MXN', 'SEK', 'NOK', 'TRY',
    'AED', 'SAR', 'EGP', 'NGN', 'KES', 'TZS', 'UGX'
  ];

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    setFetching(true);
    try {
      const data = await getStores();
      setStores(data);
    } catch (err) {
      setMessage('Failed to fetch stores');
      setMessageType('error');
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleAddStore = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage('Name and Email are required');
      setMessageType('error');
      return;
    }
    setLoading(true);
    try {
      await createStore(formData);
      setMessage('Store added successfully!');
      setMessageType('success');
      setShowAddModal(false);
      setFormData({ name: '', address: '', phone: '', email: '', tax_rate: '', currency: 'USD', timezone: 'UTC' });
      fetchStores();
    } catch (err) {
      setMessage('Failed to add store');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStore = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage('Name and Email are required');
      setMessageType('error');
      return;
    }
    setLoading(true);
    try {
      await updateStore(editingStore.id, formData);
      setMessage('Store updated successfully!');
      setMessageType('success');
      setEditingStore(null);
      setFormData({ name: '', address: '', phone: '', email: '', tax_rate: '', currency: 'USD', timezone: 'UTC' });
      fetchStores();
    } catch (err) {
      setMessage('Failed to update store');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStore = async (id) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      setLoading(true);
      try {
        await deleteStore(id);
        setMessage('Store deleted successfully!');
        setMessageType('success');
        fetchStores();
      } catch (err) {
        setMessage('Failed to delete store');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditModal = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      address: store.address,
      phone: store.phone,
      email: store.email,
      tax_rate: store.tax_rate,
      currency: store.currency,
      timezone: store.timezone,
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingStore(null);
    setFormData({ name: '', address: '', phone: '', email: '', tax_rate: '', currency: 'USD', timezone: 'UTC' });
  };

  return (
    <div className="flex flex-col w-full min-h-screen space-y-4 sm:space-y-6">
      {/* Feedback Message */}
      {message && (
        <div className={`mb-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
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
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Store Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>➕</span>
            Add Store
          </button>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your stores and their configuration.
        </p>
      </div>
      {/* Store List - Table for sm+ */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full">
        <div className="overflow-x-auto hidden sm:block">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3 px-3 font-semibold">Store Name</th>
                <th className="py-3 px-3 font-semibold">Address</th>
                <th className="py-3 px-3 font-semibold">Phone</th>
                <th className="py-3 px-3 font-semibold">Email</th>
                <th className="py-3 px-3 font-semibold">Tax Rate</th>
                <th className="py-3 px-3 font-semibold">Currency</th>
                <th className="py-3 px-3 font-semibold">Timezone</th>
                <th className="py-3 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium">{store.name}</td>
                  <td className="py-3 px-3 text-gray-600">{store.address}</td>
                  <td className="py-3 px-3">{store.phone}</td>
                  <td className="py-3 px-3">{store.email}</td>
                  <td className="py-3 px-3">{store.tax_rate != null ? `${(store.tax_rate * 100).toFixed(2)}%` : '-'}</td>
                  <td className="py-3 px-3">{store.currency}</td>
                  <td className="py-3 px-3">{store.timezone}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(store)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteStore(store.id)}
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
          {stores.map((store) => (
            <div key={store.id} className="border rounded-xl p-4 shadow-sm bg-white">
              <div className="font-semibold text-lg text-gray-800 mb-1">{store.name}</div>
              <div className="text-gray-600 text-sm mb-1">Address: {store.address}</div>
              <div className="text-gray-600 text-sm mb-1">Phone: {store.phone}</div>
              <div className="text-gray-600 text-sm mb-1">Email: {store.email}</div>
              <div className="text-gray-600 text-sm mb-1">Tax Rate: {store.tax_rate != null ? `${(store.tax_rate * 100).toFixed(2)}%` : '-'}</div>
              <div className="text-gray-600 text-sm mb-1">Currency: {store.currency}</div>
              <div className="text-gray-600 text-sm mb-1">Timezone: {store.timezone}</div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => openEditModal(store)}
                  className="flex-1 bg-blue-100 text-blue-700 py-1 rounded-lg font-medium text-xs hover:bg-blue-200 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteStore(store.id)}
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
      {(showAddModal || editingStore) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingStore ? 'Edit Store' : 'Add New Store'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter store name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="2"
                  placeholder="Enter address"
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
                  Email
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
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({...formData, tax_rate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter tax rate"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {currencies.map(cur => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={editingStore ? handleEditStore : handleAddStore}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition"
              >
                {editingStore ? 'Update Store' : 'Add Store'}
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

export default Store; 