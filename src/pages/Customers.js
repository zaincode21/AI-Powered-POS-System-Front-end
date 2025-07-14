import React, { useState, useEffect } from 'react';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../services/customerService';
import { Pencil, Trash2, LayoutGrid, List } from 'lucide-react';
import { toast } from 'react-toastify';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', tin: '' });
  const [formError, setFormError] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const customersData = await getCustomers();
      setCustomers(customersData);
      setError('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line
  }, []);

  // Handle form input
  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Open Add/Edit Modal
  const openModal = (type, customer = null) => {
    setModalType(type);
    setSelectedCustomer(customer);
    setForm(customer ? { ...customer } : { full_name: '', email: '', phone: '', tin: '' });
    setShowModal(true);
    setFormError('');
  };

  // Close Modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
    setFormError('');
  };

  // Add or Edit Customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (modalType === 'add') {
        await createCustomer(form);
      } else {
        await updateCustomer(selectedCustomer.id, form);
      }
      closeModal();
      fetchCustomers();
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Delete Customer
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted successfully!');
      fetchCustomers();
    } catch (err) {
      setError(err.message);
      toast.error('Failed to delete customer.');
    }
  };

  // Filtered customers
  const filteredCustomers = customers.filter(c =>
    [c.full_name, c.email, c.phone, c.tin].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col flex-1 w-full min-h-screen p-0 sm:p-2 md:p-4 lg:p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading customer data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 w-full min-h-screen p-0 sm:p-2 md:p-4 lg:p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-purple-700">Customers Management</h1>
          
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search customers..."
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={() => openModal('add')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>➕</span>
            Add Customer
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full overflow-x-auto">
        {/* Table/Card Title and View Toggle */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="text-lg font-semibold text-purple-700">Customer List</h2>
          <button
            className="p-2 rounded hover:bg-purple-100 transition border border-purple-200"
            title={viewMode === 'table' ? 'Switch to Card View' : 'Switch to Table View'}
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
          >
            {viewMode === 'table' ? <LayoutGrid size={20} className="text-purple-700" /> : <List size={20} className="text-purple-700" />}
          </button>
        </div>
        
        {/* Table or Card View */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3 px-3 font-semibold">Customer Number</th>
                  <th className="py-3 px-3 font-semibold">Full Name</th>
                  <th className="py-3 px-3 font-semibold">Email</th>
                  <th className="py-3 px-3 font-semibold">Phone</th>
                  <th className="py-3 px-3 font-semibold">TIN</th>
                  <th className="py-3 px-3 font-semibold">Total Purchases</th>
                  <th className="py-3 px-3 font-semibold">Total Spent</th>
                  <th className="py-3 px-3 font-semibold">Loyalty Points</th>
                  <th className="py-3 px-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr><td colSpan="9" className="text-center py-4 text-gray-400">No customers found.</td></tr>
                ) : filteredCustomers.map(customer => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 font-mono  font-semibold">{customer.customer_code || 'N/A'}</td>
                    <td className="py-3 px-3 font-medium">{customer.full_name || 'N/A'}</td>
                    <td className="py-3 px-3">{customer.email || 'N/A'}</td>
                    <td className="py-3 px-3">{customer.phone || 'N/A'}</td>
                    <td className="py-3 px-3">{customer.tin || 'N/A'}</td>
                    <td className="py-3 px-3">{customer.total_purchases != null ? customer.total_purchases : 'N/A'}</td>
                    <td className="py-3 px-3">{customer.total_spent != null ? customer.total_spent : 'N/A'}</td>
                    <td className="py-3 px-3">{customer.total_purchases != null ? Math.floor(customer.total_purchases / 10) : 'N/A'}</td>
                    <td className="py-3 px-3 flex gap-2">
                      <button
                        onClick={() => openModal('edit', customer)}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 flex items-center justify-center"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200 flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-4 text-gray-400 col-span-full">No customers found.</div>
            ) : filteredCustomers.map(customer => (
              <div key={customer.id} className="border rounded-xl p-4 shadow-sm bg-white flex flex-col">
                <div className="font-semibold text-lg text-gray-800 mb-1">{customer.full_name || 'N/A'}</div>
                <div className="text-gray-600 text-sm mb-1">Customer #: <span className="font-mono">{customer.customer_code || 'N/A'}</span></div>
                <div className="text-gray-600 text-sm mb-1">Email: {customer.email || 'N/A'}</div>
                <div className="text-gray-600 text-sm mb-1">Phone: {customer.phone || 'N/A'}</div>
                <div className="text-gray-600 text-sm mb-1">TIN: {customer.tin || 'N/A'}</div>
                <div className="text-gray-600 text-sm mb-1">Total Purchases: {customer.total_purchases != null ? customer.total_purchases : 'N/A'}</div>
                <div className="text-gray-600 text-sm mb-1">Total Spent: {customer.total_spent != null ? customer.total_spent : 'N/A'}</div>
                <div className="text-gray-600 text-sm mb-1">Loyalty Points: {customer.total_purchases != null ? Math.floor(customer.total_purchases / 10) : 'N/A'}</div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => openModal('edit', customer)}
                    className="flex-1 bg-blue-100 text-blue-700 py-1 rounded-lg font-medium text-xs hover:bg-blue-200 transition flex items-center justify-center"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="flex-1 bg-red-100 text-red-700 py-1 rounded-lg font-medium text-xs hover:bg-red-200 transition flex items-center justify-center"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">{modalType === 'add' ? 'Add Customer' : 'Edit Customer'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input type="text" name="full_name" value={form.full_name} onChange={handleInput} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleInput} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="text" name="phone" value={form.phone} onChange={handleInput} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">TIN</label>
                <input type="text" name="tin" value={form.tin} onChange={handleInput} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">{modalType === 'add' ? 'Add' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers; 