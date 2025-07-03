import React, { useState, useEffect, useRef } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct as deleteProductApi,
  getPriceHistory
} from '../services/productService';
import { getCategories } from '../services/categoryService';
import { getSuppliers } from '../services/supplierService';
import { QRCodeCanvas } from 'qrcode.react';

function Product() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    cost_price: '',
    selling_price: '',
    current_stock: '',
    status: 'In Stock',
    is_active: true,
    supplier_id: '',
    change_reason: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  console.log(loading)

  const [lastCreatedProduct, setLastCreatedProduct] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const qrPrintRef = useRef();
  const closeBtnRef = useRef();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyProduct, setHistoryProduct] = useState(null);
  // const URL = 'http://1:3000';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    getSuppliers().then(setSuppliers);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (showQrModal && closeBtnRef.current) {
      closeBtnRef.current.focus();
      const handleEsc = (e) => {
        if (e.key === 'Escape') setShowQrModal(false);
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [showQrModal]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setMessage('Failed to fetch products');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setMessage('Failed to fetch categories');
      setMessageType('error');
    }
  }

  const handleAddProduct = async () => {
    if (formData.name.trim() && formData.category_id && formData.cost_price && formData.selling_price && formData.current_stock) {
      setLoading(true);
      try {
        // Check if product exists by name (and optionally category)
        const existing = products.find(
          p => p.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
               p.category_id === formData.category_id
        );
        if (existing) {
          // Update stock quantity
          const updatedStock = Number(existing.current_stock) + Number(formData.current_stock);
          const payload = {
            ...formData,
            current_stock: updatedStock,
            cost_price: Number(formData.cost_price),
            selling_price: Number(formData.selling_price),
            is_active: formData.status === 'In Stock' || formData.status === 'Low Stock',
          };
          await updateProduct(existing.id, payload);
          fetchProducts();
          setFormData({ name: '', category_id: '', description: '', cost_price: '', selling_price: '', current_stock: '', status: 'In Stock', is_active: true, supplier_id: '', change_reason: '' });
          setShowAddModal(false);
          setMessage('Product already exists. Stock updated successfully!');
          setMessageType('success');
        } else {
          const payload = {
            ...formData,
            cost_price: Number(formData.cost_price),
            selling_price: Number(formData.selling_price),
            current_stock: Number(formData.current_stock),
            is_active: formData.status === 'In Stock' || formData.status === 'Low Stock',
          };
          const created = await createProduct(payload);
          fetchProducts();
          setFormData({ name: '', category_id: '', description: '', cost_price: '', selling_price: '', current_stock: '', status: 'In Stock', is_active: true, supplier_id: '', change_reason: '' });
          setShowAddModal(false);
          setMessage('Product added successfully!');
          setMessageType('success');
          setLastCreatedProduct(created);
          setShowQrModal(true);
        }
      } catch (err) {
        let msg = 'Failed to add product';
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

  const handleEditProduct = async () => {
    if (editingProduct && formData.name.trim() && formData.category_id && formData.cost_price && formData.selling_price && formData.current_stock) {
      setLoading(true);
      try {
        const payload = {
          ...formData,
          cost_price: Number(formData.cost_price),
          selling_price: Number(formData.selling_price),
          current_stock: Number(formData.current_stock),
          is_active: formData.status === 'In Stock' || formData.status === 'Low Stock',
        };
        await updateProduct(editingProduct.id, payload);
        fetchProducts();
        setEditingProduct(null);
        setFormData({ name: '', category_id: '', description: '', cost_price: '', selling_price: '', current_stock: '', status: 'In Stock', is_active: true, supplier_id: '', change_reason: '' });
        setMessage('Product updated successfully!');
        setMessageType('success');
      } catch (err) {
        let msg = 'Failed to update product';
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

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        await deleteProductApi(id);
        fetchProducts();
        setMessage('Product deleted successfully!');
        setMessageType('success');
      } catch (err) {
        let msg = 'Failed to delete product';
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

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category_id: product.category_id,
      description: product.description || '',
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      current_stock: product.current_stock,
      status: product.is_active ? (product.current_stock <= (product.min_stock_level || 5) ? 'Low Stock' : 'In Stock') : 'Out of Stock',
      is_active: product.is_active,
      supplier_id: product.supplier_id,
      change_reason: '',
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setFormData({ name: '', category_id: '', description: '', cost_price: '', selling_price: '', current_stock: '', status: 'In Stock', is_active: true, supplier_id: '', change_reason: '' });
  };

  const renderQrModal = () => {
    if (!showQrModal || !lastCreatedProduct) return null;
    const productParam = encodeURIComponent(JSON.stringify({
      id: lastCreatedProduct.id,
      name: lastCreatedProduct.name,
      selling_price: lastCreatedProduct.selling_price,
      cost_price: lastCreatedProduct.cost_price
    }));
    const qrValue = `${window.location.origin}/sale_items?product=${productParam}`;
    const businessName = 'Your Business Name'; // Replace with your real business name or logo
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center relative animate-fade-in">
          <div ref={qrPrintRef} className="print-area w-full flex flex-col items-center">
            <div className="text-2xl font-extrabold text-purple-700 mb-2 tracking-wide">{businessName}</div>
            <h2 className="text-lg font-bold mb-2">Product QR Code</h2>
            <QRCodeCanvas value={qrValue} size={180} className="mb-4" />
            <hr className="w-1/2 my-3 border-gray-300" />
            <div className="mt-2 text-xl font-semibold text-gray-900">{lastCreatedProduct.name}</div>
            <div className="mb-2 text-lg text-gray-700 font-medium">Cost: ${Number(lastCreatedProduct.cost_price).toFixed(2)}</div>
            <div className="text-xs text-gray-500 italic mb-2">Scan this code for product info</div>
          </div>
          <div className="flex gap-3 mt-4 w-full justify-center">
            <button
              ref={closeBtnRef}
              onClick={() => setShowQrModal(false)}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Close
            </button>
            <button
              onClick={() => {
                const printContents = qrPrintRef.current.innerHTML;
                const printWindow = window.open('', '', 'height=500,width=400');
                printWindow.document.write('<html><head><title>Print QR Code</title>');
                printWindow.document.write('<style>\
                  @media print {\
                    body { margin: 0; background: #fff; }\
                    .print-area { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100vw; height: 100vh; font-family: sans-serif; }\
                    .print-area h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }\
                    .print-area .text-2xl { font-size: 2rem; margin-bottom: 0.5rem; color: #7c3aed; font-weight: bold; }\
                    .print-area .text-xl { font-size: 1.25rem; font-weight: 600; }\
                    .print-area .text-lg { font-size: 1.1rem; font-weight: 500; }\
                    .print-area .text-xs { font-size: 0.8rem; color: #888; }\
                  }\
                </style>');
                printWindow.document.write('</head><body >');
                printWindow.document.write('<div class="print-area">' + printContents + '</div>');
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
              }}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9v12h12V9M9 9V3h6v6" /></svg>
              Print
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add this function to show QR modal for any product
  const handleShowQr = (product) => {
    setLastCreatedProduct(product);
    setShowQrModal(true);
  };

  const handleShowHistory = async (product) => {
    setShowHistoryModal(true);
    setHistoryProduct(product);
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const data = await getPriceHistory(product.id);
      setHistoryData(data);
    } catch (err) {
      setHistoryError('Failed to fetch price history');
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen space-y-4 sm:space-y-6">
      {renderQrModal()}
      {/* Feedback Message */}
      {message && (
        <div className={`mb-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Product Management</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>➕</span>
            Add Product
          </button>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your products and inventory efficiently.
        </p>
      </div>

      {/* Product List - Table for sm+ */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full">
        <div className="overflow-x-auto hidden sm:block">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3 px-3 font-semibold">Product Name</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold">Supplier</th>
                <th className="py-3 px-3 font-semibold">Stock</th>
                <th className="py-3 px-3 font-semibold">Price</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium">{product.name}</td>
                  <td className="py-3 px-3 text-gray-600">
                    {product.category_name || '-'}
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {product.supplier_name || '-'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.current_stock < 40 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {product.current_stock != null && !isNaN(Number(product.current_stock))
                        ? `${product.current_stock} units`
                        : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {product.selling_price != null && !isNaN(Number(product.selling_price))
                      ? `$${Number(product.selling_price).toFixed(2)}`
                      : '-'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      !product.is_active
                        ? 'bg-gray-100 text-gray-700'
                        : product.current_stock <= (product.min_stock_level || 5)
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                    }`}>
                      {!product.is_active
                        ? 'Out of Stock'
                        : product.current_stock <= (product.min_stock_level || 5)
                          ? 'Low Stock'
                          : 'In Stock'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                      {/* QR Code Action Button */}
                      <button
                        onClick={() => handleShowQr(product)}
                        className="text-purple-600 hover:text-purple-800 p-1"
                        title="Show QR Code"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                          <path d="M7 17h.01M17 7h.01M10 10h4v4h-4z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleShowHistory(product)}
                        className="text-yellow-600 hover:text-yellow-800 p-1"
                        title="View Price History"
                      >
                        🕑
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
          {products.map((product) => (
            <div key={product.id} className="border rounded-xl p-4 shadow-sm bg-white">
              <div className="font-semibold text-lg text-gray-800 mb-1">{product.name}</div>
              <div className="text-gray-600 text-sm mb-2">Category: {product.category_name || '-'}</div>
              <div className="text-gray-600 text-sm mb-2">Supplier: {product.supplier_name || '-'}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  product.current_stock < 40 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-800'
                }`}>
                  {product.current_stock != null && !isNaN(Number(product.current_stock))
                    ? `${product.current_stock} units`
                    : '-'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  !product.is_active
                    ? 'bg-gray-100 text-gray-700'
                    : product.current_stock <= (product.min_stock_level || 5)
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                }`}>
                  {!product.is_active
                    ? 'Out of Stock'
                    : product.current_stock <= (product.min_stock_level || 5)
                      ? 'Low Stock'
                      : 'In Stock'}
                </span>
              </div>
              <div className="text-gray-800 font-semibold mb-2">
                {product.selling_price != null && !isNaN(Number(product.selling_price))
                  ? `$${Number(product.selling_price).toFixed(2)}`
                  : '-'}
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => openEditModal(product)}
                  className="flex-1 bg-blue-100 text-blue-700 py-1 rounded-lg font-medium text-xs hover:bg-blue-200 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="flex-1 bg-red-100 text-red-700 py-1 rounded-lg font-medium text-xs hover:bg-red-200 transition"
                >
                  🗑️ Delete
                </button>
                {/* QR Code Action Button */}
                <button
                  onClick={() => handleShowQr(product)}
                  className="flex-1 bg-purple-100 text-purple-700 py-1 rounded-lg font-medium text-xs hover:bg-purple-200 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 17h.01M17 7h.01M10 10h4v4h-4z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  QR
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({...formData, current_stock: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter stock quantity"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price *
                </label>
                <input
                  type="number"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter cost price"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price *
                </label>
                <input
                  type="number"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({...formData, selling_price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter selling price"
                  min="0"
                  step="0.01"
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
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier (Email)
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Change Reason (optional)
                </label>
                <input
                  type="text"
                  value={formData.change_reason}
                  onChange={e => setFormData({ ...formData, change_reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Reason for price change (if any)"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={editingProduct ? handleEditProduct : handleAddProduct}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
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

      {/* Price History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Price History for {historyProduct?.name}</h2>
            {historyLoading ? (
              <div>Loading...</div>
            ) : historyError ? (
              <div className="text-red-600">{historyError}</div>
            ) : historyData.length === 0 ? (
              <div>No price history found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm border">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-3 font-semibold">Old Price</th>
                      <th className="py-2 px-3 font-semibold">New Price</th>
                      <th className="py-2 px-3 font-semibold">User ID</th>
                      <th className="py-2 px-3 font-semibold">Reason</th>
                      <th className="py-2 px-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((h, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-3">${Number(h.old_price).toFixed(2)}</td>
                        <td className="py-2 px-3">${Number(h.new_price).toFixed(2)}</td>
                        <td className="py-2 px-3">{h.user_id || '-'}</td>
                        <td className="py-2 px-3">{h.change_reason}</td>
                        <td className="py-2 px-3">{h.created_at ? new Date(h.created_at).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Product; 