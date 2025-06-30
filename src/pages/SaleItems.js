import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/productService';
import { getUsers } from '../services/userService';
import { getStores } from '../services/storeService';
import { getCustomers } from '../services/customerService';
import { useLocation } from 'react-router-dom';

function SaleItems() {
  // Master (sale) state
  const [sale, setSale] = useState({
    customer_id: '',
    user_id: '',
    store_id: '',
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    payment_method: 'cash',
    payment_status: 'completed',
    notes: '',
    loyalty_points_earned: 0,
    loyalty_points_redeemed: 0,
  });

  // Detail (items) state
  const [items, setItems] = useState([]);
  const [itemForm, setItemForm] = useState({
    product_id: '',
    product_name: '',
    quantity: 1,
    unit_price: 0,
    discount_amount: 0,
    product_sku: '',
    product_barcode: '',
  });
  const [editingItemId, setEditingItemId] = useState(null);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [sales, setSales] = useState([]); // All sales for Read
  const [editingSaleId, setEditingSaleId] = useState(null); // For Update
  const [customers, setCustomers] = useState([]);
  const [receiptData, setReceiptData] = useState(null);

  const location = useLocation();

  // Place these calculations before the return statement
  const computedSubtotal = receiptData && receiptData.items
    ? receiptData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    : 0;
  const subtotal = (receiptData && receiptData.subtotal !== undefined && receiptData.subtotal !== null)
    ? Number(receiptData.subtotal)
    : computedSubtotal;
  const vat = subtotal * 0.18;
  const total = subtotal + vat - Number(receiptData && receiptData.discount_amount || 0);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]));
    getUsers().then(setUsers).catch(() => setUsers([]));
    getStores().then(setStores).catch(() => setStores([]));
    getCustomers().then(setCustomers).catch(() => setCustomers([]));
    fetchSales();
    // Parse product info from URL if present
    const params = new URLSearchParams(location.search);
    const productParam = params.get('product');
    if (productParam) {
      try {
        const product = JSON.parse(decodeURIComponent(productParam));
        setItemForm(itemForm => ({
          ...itemForm,
          product_id: product.id,
          product_name: product.name,
          unit_price: product.selling_price || product.cost_price || 0,
        }));
      } catch (e) {
        // Invalid QR or param
      }
    }
  }, [location.search]);

  // Fetch all sales (Read)
  const fetchSales = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sales');
      if (!res.ok) throw new Error('Failed to fetch sales');
      const data = await res.json();
      setSales(data);
      } catch {
      setSales([]);
    }
  };

  // Example AI insights data
  const aiInsights = [
    { name: 'Iphone 12', current: 5, reorder: 20 },
    { name: 'HP', current: 3, reorder: 15 }
  ];

  // Add or update item in detail list
  const addOrUpdateItem = () => {
    if (!itemForm.product_id || !itemForm.quantity || !itemForm.unit_price) {
      setMessage('Please fill all required item fields.');
      setMessageType('error');
      return;
    }
    // Find the selected product
    const selectedProduct = products.find(p => p.id === itemForm.product_id);
    const stock = selectedProduct ? Number(selectedProduct.current_stock) : 0;
    if (Number(itemForm.quantity) > stock) {
      setMessage('You selected more than what we have in stock');
      setMessageType('error');
      return;
    }
    // Ensure numeric fields are numbers
    const newItem = {
      ...itemForm,
      quantity: Number(itemForm.quantity),
      unit_price: Number(itemForm.unit_price),
      discount_amount: Number(itemForm.discount_amount) || 0,
    };
    if (editingItemId) {
      setItems(items.map(item => item.id === editingItemId ? { ...newItem, id: editingItemId } : item));
      setEditingItemId(null);
    } else {
      // Prevent duplicate products: sum quantities if exists
      const existing = items.find(i => i.product_id === newItem.product_id);
      if (existing) {
        setItems(items.map(i =>
          i.product_id === newItem.product_id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        ));
      } else {
        setItems([...items, { ...newItem, id: Date.now() }]);
      }
    }
    setItemForm({
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      product_sku: '',
      product_barcode: '',
    });
  };

  // Remove item from detail list
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    setEditingItemId(null);
    setItemForm({
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      product_sku: '',
      product_barcode: '',
    });
  };

  // Edit item in detail list
  const editItem = (item) => {
    setEditingItemId(item.id);
    setItemForm({ ...item });
  };

  // Cancel editing sale
  const handleCancel = () => {
    setEditingSaleId(null);
    setSale({
      customer_id: '',
      user_id: '',
      store_id: '',
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      payment_method: 'cash',
      payment_status: 'completed',
      notes: '',
      loyalty_points_earned: 0,
      loyalty_points_redeemed: 0,
    });
    setItems([]);
    setItemForm({
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      product_sku: '',
      product_barcode: '',
    });
    setEditingItemId(null);
  };

  // Handle master form change
  const handleSaleChange = (e) => {
    setSale({ ...sale, [e.target.name]: e.target.value });
  };

  // Handle detail form change
  const handleItemChange = (e) => {
    setItemForm({ ...itemForm, [e.target.name]: e.target.value });
  };

  // Delete a sale
  const handleDeleteSale = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) return;
      setLoading(true);
      try {
      const res = await fetch(`http://localhost:5000/api/sales/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete sale');
      setMessage('Sale deleted successfully!');
        setMessageType('success');
      fetchSales();
      } catch {
      setMessage('Failed to delete sale.');
        setMessageType('error');
      } finally {
        setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Edit a sale (load into form)
  const handleEditSale = (saleObj) => {
    setEditingSaleId(saleObj.id);
    setSale({
      customer_id: saleObj.customer_id || '',
      user_id: saleObj.user_id || '',
      store_id: saleObj.store_id || '',
      subtotal: saleObj.subtotal || 0,
      tax_amount: saleObj.tax_amount || 0,
      discount_amount: saleObj.discount_amount || 0,
      total_amount: saleObj.total_amount || 0,
      payment_method: saleObj.payment_method || 'cash',
      payment_status: saleObj.payment_status || 'completed',
      notes: saleObj.notes || '',
      loyalty_points_earned: saleObj.loyalty_points_earned || 0,
      loyalty_points_redeemed: saleObj.loyalty_points_redeemed || 0,
    });
    setItems(saleObj.items || []);
    setItemForm({
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      product_sku: '',
      product_barcode: '',
    });
    setEditingItemId(null);
  };

  // Add or update sale (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!sale.customer_id || !sale.user_id || !sale.store_id) {
      setMessage('Please fill all required sale fields.');
      setMessageType('error');
      return;
    }
    if (items.length === 0) {
      setMessage('Please add at least one sale item.');
      setMessageType('error');
      return;
    }
    setLoading(true);
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const total_discount = items.reduce((sum, item) => sum + Number(item.discount_amount || 0), 0);
    const total_amount = subtotal + Number(sale.tax_amount) - total_discount;
    const saleData = {
      sale: {
        ...sale,
        subtotal,
        discount_amount: total_discount,
        total_amount,
      },
      items: items.map(({ id, ...rest }) => rest),
    };
    try {
      let response;
      if (editingSaleId) {
        response = await fetch(`http://localhost:5000/api/sales/${editingSaleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saleData),
        });
      } else {
        response = await fetch('http://localhost:5000/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saleData),
        });
      }
      const result = await response.json();
      if (!response.ok) {
        // Show inventory warning if insufficient stock
        if (result.error && result.error.toLowerCase().includes('insufficient stock')) {
          setMessage(result.error);
          setMessageType('error');
          return;
        }
        throw new Error(result.error || result.details || 'Failed to submit sale.');
      }
      setReceiptData(result); // Show receipt popup
      setMessage(editingSaleId ? 'Sale updated successfully!' : 'Sale submitted successfully!');
      setMessageType('success');
      handleCancel();
      fetchSales();
    } catch (err) {
      setMessage(err.message || 'Failed to submit sale.');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Live calculation
  const total_amount = subtotal + Number(sale.tax_amount) - Number(sale.discount_amount || 0);

  // Fetch and show receipt for any sale
  const handleViewReceipt = async (saleId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/sales/with-items/${saleId}`);
      if (!res.ok) throw new Error('Failed to fetch sale receipt');
      const data = await res.json();
      setReceiptData(data);
    } catch (err) {
      setMessage('Failed to load receipt');
      setMessageType('error');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen space-y-4 sm:space-y-6">
      {/* Full-screen error alert banner */}
      {message && messageType === 'error' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
          <div className="w-full bg-red-600 text-white text-center py-4 text-lg font-bold shadow-lg">
            {message}
          </div>
        </div>
      )}
      {/* Feedback Message (success or non-error) */}
      {message && messageType === 'success' && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800">
          {message}
        </div>
      )}
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Sales Management</h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your sales and sale items efficiently. Use the AI panel below for smart recommendations.
        </p>
      </div>
      {/* AI Insights Panel */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mb-4">
        <div className="flex items-center mb-2">
          <span className="text-red-500 text-xl mr-2">🤖</span>
          <span className="font-semibold text-red-700 text-base">AI Sales Insights</span>
                    </div>
        <div className="text-red-700 text-sm mb-3">
          {aiInsights.length} products are low in stock based on AI demand forecasting.
        </div>
        <div className="space-y-3">
          {aiInsights.map((alert, idx) => (
            <div key={idx} className="bg-white border border-red-200 rounded-lg p-3">
              <div className="font-semibold text-gray-800">{alert.name}</div>
              <div className="text-gray-600 text-xs">Current: {alert.current} units</div>
              <div className="text-red-600 text-xs font-medium">AI Reorder Suggestion: {alert.reorder} units</div>
            </div>
          ))}
        </div>
      </div>
      {/* Master-Detail Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Master Section */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Sale Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <select name="customer_id" value={sale.customer_id} onChange={handleSaleChange} className="border p-2 rounded w-full">
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name} ({customer.customer_code})
                  </option>
                ))}
              </select>
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User *</label>
              <select name="user_id" value={sale.user_id} onChange={handleSaleChange} className="border p-2 rounded w-full">
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name || user.username || user.email}</option>
                ))}
              </select>
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store *</label>
              <select name="store_id" value={sale.store_id} onChange={handleSaleChange} className="border p-2 rounded w-full">
                <option value="">Select Store</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name || store.store_name || store.id}</option>
                ))}
              </select>
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select name="payment_method" value={sale.payment_method} onChange={handleSaleChange} className="border p-2 rounded w-full">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="digital">Digital</option>
                <option value="gift_card">Gift Card</option>
                <option value="store_credit">Store Credit</option>
              </select>
              </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input name="notes" value={sale.notes} onChange={handleSaleChange} placeholder="Notes" className="border p-2 rounded w-full" />
            </div>
          </div>
          {/* Live calculation display */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-gray-700">Subtotal: <span className="font-semibold">${subtotal.toFixed(2)}</span></div>
            <div className="text-gray-700">Discount: <span className="font-semibold">${Number(sale.discount_amount).toFixed(2)}</span></div>
            <div className="text-gray-700">Total: <span className="font-semibold">${total_amount.toFixed(2)}</span></div>
          </div>
        </div>
        {/* Detail Section */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Sale Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
              <select
                name="product_id"
                value={itemForm.product_id}
                onChange={e => {
                  const selected = products.find(p => p.id === e.target.value);
                  setItemForm({
                    ...itemForm,
                    product_id: e.target.value,
                    product_name: selected ? selected.name : '',
                    product_sku: selected ? selected.sku : '',
                    product_barcode: selected ? selected.barcode : '',
                    unit_price: selected ? selected.selling_price : 0,
                  });
                }}
                className="border p-2 rounded w-full"
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input name="quantity" type="number" value={itemForm.quantity} onChange={handleItemChange} placeholder="Qty" className="border p-2 rounded w-full" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price </label>
              <input name="unit_price" type="number" value={itemForm.unit_price} onChange={handleItemChange} placeholder="Unit Price" className="border p-2 rounded w-full" min="0" step="0.01" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
              <input name="discount_amount" type="number" value={itemForm.discount_amount} onChange={handleItemChange} placeholder="Discount" className="border p-2 rounded w-full" min="0" step="0.01" />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={addOrUpdateItem}
                className={`flex items-center justify-center gap-2 rounded px-3 py-2 w-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${editingItemId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                {editingItemId ? (
                  <>
                    <span className="material-icons text-base">edit</span> Update
                  </>
                ) : (
                  <>
                    <span className="material-icons text-base">add</span> Add
                  </>
                )}
              </button>
            </div>
            <div className="flex items-end">
              {editingItemId && (
                <button type="button" onClick={() => { setEditingItemId(null); setItemForm({ product_id: '', product_name: '', quantity: 1, unit_price: 0, discount_amount: 0, product_sku: '', product_barcode: '' }); }} className="bg-gray-400 text-white rounded px-2 w-full">Cancel</button>
              )}
            </div>
          </div>
          {/* Responsive Sale Items Table/Card */}
          <div>
            {/* Table for sm+ screens */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm hidden sm:block">
              <table className="min-w-full text-xs sm:text-sm bg-white rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="py-3 px-3 font-semibold text-left rounded-tl-xl">Name</th>
                    <th className="py-3 px-3 font-semibold text-right">Qty</th>
                    <th className="py-3 px-3 font-semibold text-right">Unit Price</th>
                    <th className="py-3 px-3 font-semibold text-right rounded-tr-xl">Discount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-400">No sale items added yet.</td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-2 px-3 font-medium text-gray-800">{item.product_name}</td>
                        <td className="py-2 px-3 text-right">{item.quantity}</td>
                        <td className="py-2 px-3 text-right">${Number(item.unit_price).toFixed(2)}</td>
                        <td className="py-2 px-3 text-right">${Number(item.discount_amount).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                  {/* Total Amount Row */}
                  <tr className="font-bold bg-purple-50 border-t border-purple-200">
                    <td colSpan={2} className="py-3 px-3 text-right text-purple-700">Total</td>
                    <td colSpan={2} className="py-3 px-3 text-right text-purple-700">
                      {items.length > 0 ?
                        `$${items.reduce((sum, item) => sum + (item.quantity * item.unit_price - (item.discount_amount || 0)), 0).toFixed(2)}`
                        : '$0.00'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Card/List for xs screens */}
            <div className="sm:hidden space-y-3">
              {items.length === 0 ? (
                <div className="py-6 text-center text-gray-400 border rounded-xl">No sale items added yet.</div>
              ) : (
                items.map((item, idx) => (
                  <div key={item.id} className="border rounded-xl p-3 bg-white flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-800">{item.product_name}</span>
                      <span className="text-xs text-gray-500">Qty: <span className="font-bold">{item.quantity}</span></span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Unit Price:</span>
                      <span className="font-semibold">${Number(item.unit_price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Discount:</span>
                      <span className="font-semibold">${Number(item.discount_amount).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
              {/* Total Row */}
              <div className="font-bold bg-purple-50 border border-purple-200 rounded-xl p-3 flex justify-between mt-2 text-purple-700">
                <span>Total</span>
                <span>
                  {items.length > 0 ?
                    `$${items.reduce((sum, item) => sum + (item.quantity * item.unit_price - (item.discount_amount || 0)), 0).toFixed(2)}`
                    : '$0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Submit/Cancel */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded w-full sm:w-auto" disabled={loading}>{loading ? 'Submitting...' : (editingSaleId ? 'Update Sale' : 'Submit Sale')}</button>
          {(editingSaleId || items.length > 0) && (
            <button type="button" onClick={handleCancel} className="bg-gray-400 text-white px-4 py-2 rounded w-full sm:w-auto" disabled={loading}>Cancel</button>
      )}
        </div>
      </form>
      {/* Receipt Popup Modal */}
      {receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 print:p-0">
          <div
            className="pos-receipt bg-white rounded-lg shadow-2xl p-8 w-full max-w-md font-sans text-base print:rounded-none print:shadow-none print:p-0 border border-gray-200"
            style={{ minWidth: 360, maxWidth: 420 }}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl print:hidden no-print"
              onClick={() => setReceiptData(null)}
              title="Close"
            >×</button>

            {/* Store Name and Info */}
            <div className="text-center font-extrabold text-2xl mb-2 tracking-wide text-purple-700">XYZ Electronics Store</div>
            <div className="text-center text-gray-600 mb-1 text-sm">123 Main St, Kigali</div>
            <div className="text-center text-gray-600 mb-3 text-sm">Phone: +250 789 123 456</div>
            <div className="text-center text-gray-300 mb-3">────────────────────────────</div>

            {/* Receipt Info */}
            <div className="flex justify-between mb-1">
              <span className="font-medium">Receipt:</span>
              <span className="text-gray-700">{receiptData.sale_number?.replace('SL-', '') || receiptData.id}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Date:</span>
              <span className="text-gray-700">
                {receiptData.sale_date ? receiptData.sale_date.slice(2, 10).replace(/-/g, '/') : ''}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Time:</span>
              <span className="text-gray-700">
                {receiptData.sale_date
                  ? new Date(receiptData.sale_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Cashier:</span>
              <span className="text-gray-700">John Doe</span> {/* Replace with actual cashier if available */}
            </div>
            <div className="flex justify-between mb-3">
              <span className="font-medium">Payment:</span>
              <span className="text-gray-700">Cash</span> {/* Replace with actual payment method if available */}
            </div>
            <div className="mb-1 text-gray-700">
              <span className="font-medium">Customer:</span> {receiptData.customer_name || (receiptData.customer?.first_name + ' ' + receiptData.customer?.last_name) || ''}
            </div>
            <div className="text-center text-gray-300 mb-3">────────────────────────────</div>

            {/* Items Table */}
            <div>
              <div className="flex font-bold border-b border-dashed pb-2 mb-2 text-base">
                <span className="flex-1">Item</span>
                <span className="w-10 text-right">Qty</span>
                <span className="w-16 text-right">Price</span>
                <span className="w-16 text-right">Total</span>
              </div>
              {receiptData.items && receiptData.items.map((item, idx) => (
                <div className="flex items-center mb-1.5" key={idx}>
                  <span className="flex-1 truncate">{item.product_name}</span>
                  <span className="w-10 text-right">{item.quantity}</span>
                  <span className="w-16 text-right">${Number(item.unit_price).toFixed(2)}</span>
                  <span className="w-16 text-right">${(item.quantity * item.unit_price).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="text-center text-gray-300 mt-3 mb-3">────────────────────────────</div>

            {/* Totals */}
            <div className="flex justify-between mb-2 text-base">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-base">
              <span>Discount:</span>
              <span className="text-green-600">-${Number(receiptData && receiptData.discount_amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-base">
              <span>VAT 18%:</span>
              <span>${vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-dashed mt-3 pt-3 text-xl">
              <span>Total:</span>
              <span className="text-purple-700">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span>Paid:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-base">
              <span>Balance:</span>
              <span>$0.00</span>
            </div>
            <div className="text-center text-gray-300 mt-3 mb-3">────────────────────────────</div>

            {/* Thank You */}
            <div className="text-center mt-3 mb-1 font-semibold text-purple-700 text-lg">Thank you for shopping!</div>
            <div className="text-center text-xs text-gray-400 mb-2">We appreciate your business. Please come again!</div>

            {/* Print and Close Buttons */}
            <div className="flex gap-2 mt-4 print:hidden no-print">
              <button
                className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded w-full font-semibold shadow text-base"
                onClick={() => window.print()}
              >Print Receipt</button>
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded w-full font-semibold shadow text-base"
                onClick={() => setReceiptData(null)}
              >Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Sales Table (Read) - Now at the bottom */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full mt-4">
        <h2 className="text-lg font-bold mb-4">All Sales</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-xs sm:text-sm bg-white rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-3 font-semibold text-left whitespace-nowrap">Sale #</th>
                <th className="py-3 px-3 font-semibold text-left whitespace-nowrap">Product Name(s)</th>
                <th className="py-3 px-3 font-semibold text-right whitespace-nowrap">Quantity</th>
                <th className="py-3 px-3 font-semibold text-right whitespace-nowrap">Unit Price</th>
                <th className="py-3 px-3 font-semibold text-right whitespace-nowrap">Total Amount</th>
                <th className="py-3 px-3 font-semibold text-left whitespace-nowrap">Date</th>
                <th className="py-3 px-3 font-semibold text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, idx) => {
                const items = sale.items || [];
                const productNames = items.map(i => i.product_name).join(', ');
                const totalQty = items.reduce((sum, i) => sum + Number(i.quantity), 0);
                const unitPrices = items.map(i => Number(i.unit_price).toFixed(2)).join(', ');
                return (
                  <tr key={sale.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-purple-50 transition'}>
                    <td className="py-2 px-3 font-semibold text-gray-800 whitespace-nowrap">{sale.sale_number}</td>
                    <td className="py-2 px-3 whitespace-nowrap truncate max-w-xs">{productNames}</td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">{totalQty}</td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">{unitPrices}</td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">${sale.total_amount}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{sale.sale_date ? sale.sale_date.slice(0, 10) : ''}</td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleViewReceipt(sale.id)}
                        className="text-green-600 hover:text-green-800 p-1 mr-2"
                      >
                        View Receipt
                      </button>
                      <button onClick={() => handleEditSale(sale)} className="text-blue-600 hover:text-blue-800 p-1 mr-2">Edit</button>
                      <button onClick={() => handleDeleteSale(sale.id)} className="text-red-600 hover:text-red-800 p-1">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SaleItems; 