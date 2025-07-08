import React, { useEffect, useState } from 'react';
import { getSales, getSaleItems, deleteSale } from '../services/saleService';

function Sales() {
  const [sales, setSales] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    async function fetchSales() {
      setLoading(true);
      setError('');
      try {
        const data = await getSales();
        setSales(data);
      } catch (err) {
        setError('Failed to fetch sales');
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, []);

  const handleExpand = async (saleId) => {
    setExpanded(prev => ({ ...prev, [saleId]: !prev[saleId] }));
    if (!items[saleId]) {
      try {
        const data = await getSaleItems(saleId);
        setItems(prev => ({ ...prev, [saleId]: data }));
      } catch {
        setItems(prev => ({ ...prev, [saleId]: [] }));
      }
    }
  };

  const handleDelete = async (saleId) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await deleteSale(saleId);
        setSales(sales.filter(s => s.id !== saleId));
        setMessage('Sale deleted successfully!');
        setMessageType('success');
      } catch (err) {
        setMessage('Failed to delete sale');
        setMessageType('error');
      }
    }
  };

  const handleEdit = (sale) => {
    setSelectedSale(sale);
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setSelectedSale(null);
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 w-full min-h-screen p-0 sm:p-2 md:p-4 lg:p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sales data...</p>
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
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Sales Management</h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          View all sales and their items. Expand a sale to see its details.
        </p>
        {message && (
          <div className={`mt-2 text-sm font-semibold ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message}</div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {sales.map(sale => (
          <div key={sale.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-purple-700 font-bold">{sale.sale_number || sale.id}</span>
              <span className="text-xs text-gray-500">{sale.created_at ? new Date(sale.created_at).toLocaleString() : '-'}</span>
            </div>
            <div className="text-sm text-gray-800 font-semibold">{sale.customer_name || '-'}</div>
            <div className="text-xs text-gray-600">User: <span className="font-medium text-gray-800">{sale.user_name || '-'}</span></div>
            <div className="text-xs text-gray-600">Store: <span className="font-medium text-gray-800">{sale.store_name || '-'}</span></div>
            <div className="text-xs text-gray-600">Products: <span className="font-medium text-gray-800">{Array.isArray(sale.items) ? sale.items.map(i => i.product_name).join(', ') : '-'}</span></div>
            <div className="text-xs text-gray-600">Quantity: <span className="font-medium text-gray-800">{Array.isArray(sale.items) ? sale.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : '-'}</span></div>
            <div className="text-xs text-gray-600">Total: <span className="font-medium text-gray-800">${sale.total_amount?.toFixed ? sale.total_amount.toFixed(2) : sale.total_amount}</span></div>
            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 bg-blue-100 text-blue-700 py-1 rounded-lg font-medium text-xs hover:bg-blue-200 transition"
                onClick={() => handleEdit(sale)}
              >
                Edit
              </button>
              <button
                className="flex-1 bg-red-100 text-red-700 py-1 rounded-lg font-medium text-xs hover:bg-red-200 transition"
                onClick={() => handleDelete(sale.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sales List - Table for md+ */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full hidden sm:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3 px-3 font-semibold">Sale Number</th>
                <th className="py-3 px-3 font-semibold">Customer</th>
                <th className="py-3 px-3 font-semibold">User</th>
                <th className="py-3 px-3 font-semibold">Store</th>
                <th className="py-3 px-3 font-semibold">Products</th>
                <th className="py-3 px-3 font-semibold">Quantities</th>
                <th className="py-3 px-3 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold">Total</th>
                <th className="py-3 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-3">{sale.sale_number || sale.id}</td>
                  <td className="py-3 px-3">{sale.customer_name || '-'}</td>
                  <td className="py-3 px-3">{sale.user_name || '-'}</td>
                  <td className="py-3 px-3">{sale.store_name || '-'}</td>
                  <td className="py-3 px-3">{Array.isArray(sale.items) ? sale.items.map(i => i.product_name).join(', ') : '-'}</td>
                  <td className="py-3 px-3">{Array.isArray(sale.items) ? sale.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : '-'}</td>
                  <td className="py-3 px-3">{sale.created_at ? new Date(sale.created_at).toLocaleString() : '-'}</td>
                  <td className="py-3 px-3">${sale.total_amount?.toFixed ? sale.total_amount.toFixed(2) : sale.total_amount}</td>
                  <td className="py-3 px-3 flex gap-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleEdit(sale)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(sale.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Sale Details</h2>
            <div className="mb-2"><b>Sale Number:</b> {selectedSale.sale_number}</div>
            <div className="mb-2"><b>Date:</b> {selectedSale.created_at ? new Date(selectedSale.created_at).toLocaleString() : '-'}</div>
            <div className="mb-2"><b>Customer:</b> {selectedSale.customer_name || '-'}</div>
            <div className="mb-2"><b>Total:</b> ${selectedSale.total_amount?.toFixed ? selectedSale.total_amount.toFixed(2) : selectedSale.total_amount}</div>
            <button
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sales; 