import React, { useState, useEffect } from 'react';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier as deleteSupplierApi
} from '../services/supplierService';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    payment_terms: '',
    is_active: true
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function fetchSuppliers() {
    setLoading(true);
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setMessage('Failed to fetch suppliers');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  const handleAddSupplier = async () => {
    if (formData.name.trim()) {
      setLoading(true);
      try {
        await createSupplier(formData);
        fetchSuppliers();
      setFormData({ name: '', contact_person: '', email: '', phone: '', address: '', payment_terms: '', is_active: true });
      setShowAddModal(false);
        setMessage('Supplier added successfully!');
        setMessageType('success');
      } catch (err) {
        let msg = 'Failed to add supplier';
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

  const handleEditSupplier = async () => {
    if (editingSupplier && formData.name.trim()) {
      setLoading(true);
      try {
        await updateSupplier(editingSupplier.id, formData);
        fetchSuppliers();
      setEditingSupplier(null);
      setFormData({ name: '', contact_person: '', email: '', phone: '', address: '', payment_terms: '', is_active: true });
        setMessage('Supplier updated successfully!');
        setMessageType('success');
      } catch (err) {
        let msg = 'Failed to update supplier';
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

  const handleDeleteSupplier = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setLoading(true);
      try {
        await deleteSupplierApi(id);
        fetchSuppliers();
        setMessage('Supplier deleted successfully!');
        setMessageType('success');
      } catch (err) {
        let msg = 'Failed to delete supplier';
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

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({ ...supplier });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingSupplier(null);
    setFormData({ name: '', contact_person: '', email: '', phone: '', address: '', payment_terms: '', is_active: true });
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
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Suppliers Management</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>➕</span>
            Add Supplier
          </button>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your suppliers and their information.
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

      {/* Suppliers List - Table for sm+ */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full">
        <div className="overflow-x-auto hidden sm:block">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3 px-3 font-semibold">Name</th>
                <th className="py-3 px-3 font-semibold">Contact Person</th>
                <th className="py-3 px-3 font-semibold">Email</th>
                <th className="py-3 px-3 font-semibold">Phone</th>
                <th className="py-3 px-3 font-semibold">Address</th>
                <th className="py-3 px-3 font-semibold">Payment Terms</th>
                <th className="py-3 px-3 font-semibold">Active</th>
                <th className="py-3 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium">{supplier.name}</td>
                  <td className="py-3 px-3">{supplier.contact_person}</td>
                  <td className="py-3 px-3">{supplier.email}</td>
                  <td className="py-3 px-3">{supplier.phone}</td>
                  <td className="py-3 px-3">{supplier.address}</td>
                  <td className="py-3 px-3">{supplier.payment_terms}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${supplier.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{supplier.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(supplier)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(supplier.id)}
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
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="border rounded-xl p-4 shadow-sm bg-white">
              <div className="font-semibold text-lg text-gray-800 mb-1">{supplier.name}</div>
              <div className="text-gray-600 text-sm mb-1">Contact: {supplier.contact_person}</div>
              <div className="text-gray-600 text-sm mb-1">Email: {supplier.email}</div>
              <div className="text-gray-600 text-sm mb-1">Phone: {supplier.phone}</div>
              <div className="text-gray-600 text-sm mb-1">Address: {supplier.address}</div>
              <div className="text-gray-600 text-sm mb-1">Payment: {supplier.payment_terms}</div>
              <div className="mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${supplier.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{supplier.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => openEditModal(supplier)}
                  className="flex-1 bg-blue-100 text-blue-700 py-1 rounded-lg font-medium text-xs hover:bg-blue-200 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteSupplier(supplier.id)}
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
      {(showAddModal || editingSupplier) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter contact person"
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
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter payment terms"
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
                onClick={editingSupplier ? handleEditSupplier : handleAddSupplier}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition"
              >
                {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
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

      {/* Feedback Message */}
      {message && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${messageType === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {message}
            </h2>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setMessage('');
                  setMessageType('');
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Suppliers; 