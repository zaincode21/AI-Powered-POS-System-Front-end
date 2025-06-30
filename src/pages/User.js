import React, { useState, useEffect } from 'react';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser as deleteUserApi
} from '../services/userService';

function User() {
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'cashier',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }

  const handleAddUser = async () => {
    if (formData.username.trim() && formData.email.trim()) {
      setLoading(true);
      setError('');
      try {
        await createUser(formData);
        fetchUsers();
        setShowAddModal(false);
        setFormData({ username: '', email: '', full_name: '', role: 'cashier', is_active: true });
        setMessage('User added successfully!');
        setMessageType('success');
      } catch (err) {
        let msg = 'Failed to add user';
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

  const handleEditUser = async () => {
    if (editingUser && formData.username.trim() && formData.email.trim()) {
      setLoading(true);
      setError('');
      try {
        await updateUser(editingUser.id, formData);
        fetchUsers();
        setEditingUser(null);
        setFormData({ username: '', email: '', full_name: '', role: 'cashier', is_active: true });
        setMessage('User updated successfully!');
        setMessageType('success');
      } catch (err) {
        let msg = 'Failed to update user';
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

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      setError('');
      try {
        await deleteUserApi(id);
        fetchUsers();
        setMessage('User deleted successfully!');
        setMessageType('success');
      } catch (err) {
        let msg = 'Failed to delete user';
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

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    setFormData({ username: '', email: '', full_name: '', role: 'cashier', is_active: true });
  };

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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">User Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>➕</span>
            Add User
          </button>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your system users and their roles.
        </p>
      </div>

      {/* Users List - Table for sm+ */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full">
        <div className="overflow-x-auto hidden sm:block">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3 px-3 font-semibold">Username</th>
                <th className="py-3 px-3 font-semibold">Email</th>
                <th className="py-3 px-3 font-semibold">Full Name</th>
                <th className="py-3 px-3 font-semibold">Role</th>
                <th className="py-3 px-3 font-semibold">Active</th>
                <th className="py-3 px-3 font-semibold">Last Login</th>
                <th className="py-3 px-3 font-semibold">Created At</th>
                <th className="py-3 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium">{user.username}</td>
                  <td className="py-3 px-3 text-gray-600">{user.email}</td>
                  <td className="py-3 px-3">{user.full_name}</td>
                  <td className="py-3 px-3">{user.role}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs">{user.last_login || '-'}</td>
                  <td className="py-3 px-3 text-xs">{user.created_at}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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
          {users.map((user) => (
            <div key={user.id} className="border rounded-xl p-4 shadow-sm bg-white">
              <div className="font-semibold text-lg text-gray-800 mb-1">{user.username}</div>
              <div className="text-gray-600 text-sm mb-2">{user.email}</div>
              <div className="text-gray-600 text-xs mb-2">{user.full_name}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {user.role}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  user.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-1">Last Login: {user.last_login || '-'}</div>
              <div className="text-xs text-gray-500">Created: {user.created_at}</div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => openEditModal(user)}
                  className="flex-1 bg-blue-100 text-blue-700 py-1 rounded-lg font-medium text-xs hover:bg-blue-200 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
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
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editingUser ? 'Edit User' : 'Add User'}</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                editingUser ? handleEditUser() : handleAddUser();
                closeModal();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                </div>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                  <option value="inventory">Inventory</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  id="is_active"
                />
                <label htmlFor="is_active" className="text-sm">Active</label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                >
                  {editingUser ? 'Save Changes' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default User; 