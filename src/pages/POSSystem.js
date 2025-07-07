import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, CreditCard, Trash2, Plus, Minus, Receipt, X, Scan } from 'lucide-react';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { submitSale } from '../services/saleService';

const POSSystem = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showReceipt, setShowReceipt] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ full_name: '', email: '', phone: '', tin: '' });
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeError, setBarcodeError] = useState('');
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0 });
  const [cashReceived, setCashReceived] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState('');
  const [walkInCount, setWalkInCount] = useState(1);

  const taxRate = 0.08; // 8% tax

  // Retrieve user_id and store_id from user object in localStorage
  const userObj = JSON.parse(localStorage.getItem('user'));
  const userId = userObj?.id || localStorage.getItem('user_id');
  const storeId = userObj?.store_id || localStorage.getItem('store_id');

  if (!userId) {
    console.warn('No userId found in localStorage! Sale submissions will fail.');
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || String(product.category_id) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { 
        ...product, 
        price: product.selling_price, 
        quantity: 1 
      }];
    });
  };

  const updateQuantity = (id, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const product = products.find(p => p.barcode === barcodeInput.trim());
    if (product) {
      addToCart(product);
      setBarcodeInput('');
      setBarcodeError('');
    } else {
      setBarcodeError('Product not found');
      setTimeout(() => setBarcodeError(''), 3000);
    }
  };

  const handleBarcodeKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBarcodeSubmit(e);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = discount.type === 'percentage' 
    ? (subtotal * discount.value / 100)
    : Math.min(discount.value, subtotal);
  const discountedSubtotal = subtotal - discountAmount;
  const tax = discountedSubtotal * taxRate;
  const total = discountedSubtotal + tax;
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeAmount = cashReceivedNum - total;

  // Function to send sale to backend
  const sendSaleToBackend = async (transaction) => {
    if (!userId) {
      alert('User ID is missing. Please log in again.');
      return null;
    }
    try {
      // Prepare customer object (add more fields as needed)
      const customer = {
        full_name: transaction.customer.full_name,
        email: transaction.customer.email,
        phone: transaction.customer.phone,
        tin: transaction.customer.tin
      };
      // Prepare sale object
      const sale = {
        subtotal: transaction.subtotal,
        tax_amount: transaction.tax,
        discount_amount: transaction.discount,
        total_amount: transaction.total,
        payment_method: transaction.paymentMethod,
        payment_status: 'completed',
        notes: '',
        user_id: userId,
        store_id: storeId
      };
      // Debug log
      console.log('Submitting sale with user_id:', userId, 'store_id:', storeId, 'sale:', sale);
      // Prepare items array
      const items = transaction.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        discount_amount: 0, // Add discount per item if you have it
        product_name: item.name,
        product_sku: item.sku || '',
        product_barcode: item.barcode || ''
      }));
      const response = await submitSale({ customer, sale, items });
      return response;
    } catch (error) {
      alert('Error saving sale: ' + error.message);
      return null;
    }
  };

  const processPayment = async () => {
    if (paymentMethod === 'cash' && cashReceivedNum < total) {
      alert('Insufficient cash received');
      return;
    }

    const transaction = {
      id: Date.now(),
      items: cart,
      subtotal,
      discount: discountAmount,
      discountedSubtotal,
      tax,
      total,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? cashReceivedNum : null,
      change: paymentMethod === 'cash' ? changeAmount : null,
      customer: customerInfo,
      timestamp: new Date().toLocaleString()
    };

    // Send to backend
    const backendResult = await sendSaleToBackend(transaction);
    if (!backendResult) return; // error already shown

    setCurrentTransaction(transaction);
    setShowReceipt(true);
    setShowCheckout(false);
    setCart([]);
    setCustomerInfo({ full_name: '', email: '', phone: '', tin: '' });
    setDiscount({ type: 'percentage', value: 0 });
    setCashReceived('');
  };

  const openCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckout(true);
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setCurrentTransaction(null);
  };

  const closeCheckout = () => {
    setShowCheckout(false);
  };

  const generateQRCodeData = (transaction) => {
    const qrData = {
      // Transaction Details
      transactionId: transaction.id,
      timestamp: transaction.timestamp,
      total: transaction.total.toFixed(2),
      paymentMethod: transaction.paymentMethod,
      
      // Store Information
      store: "Your Store Name",
      address: "123 Main St, City, State 12345",
      phone: "(555) 123-4567",
      
      // Digital Services
      receiptUrl: `https://yourstore.com/receipt/${transaction.id}`,
      feedbackUrl: "https://yourstore.com/feedback",
      loyaltyUrl: "https://yourstore.com/loyalty",
      returnsUrl: `https://yourstore.com/returns/${transaction.id}`,
      
      // Customer Info (if provided)
      ...(transaction.customer.full_name && { customerName: transaction.customer.full_name }),
      ...(transaction.customer.phone && { customerPhone: transaction.customer.phone }),
      
      // Additional Features
      wifiNetwork: "StoreWiFi",
      socialMedia: "@yourstore",
      website: "https://yourstore.com"
    };
    return JSON.stringify(qrData);
  };

  const getQRCodeURL = (data) => {
    const encodedData = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedData}`;
  };

  useEffect(() => {
    const fetchProducts = async (categoryId = 'All') => {
      setLoadingProducts(true);
      setProductsError('');
      try {
        const data = await getProducts(categoryId);
        setProducts(data);
      } catch (err) {
        setProductsError('Failed to load products');
      }
      setLoadingProducts(false);
    };
    fetchProducts();
    // Fetch categories
    const fetchCategories = async () => {
      setCategoriesError('');
      try {
        const data = await getCategories();
        setCategories([{ name: 'All', _id: 'All' }, ...data]);
      } catch (err) {
        setCategories([{ name: 'All', _id: 'All' }]);
        setCategoriesError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    if (selectedCategory) {
      setLoadingProducts(true);
      getProducts(selectedCategory)
        .then(data => setProducts(data))
        .catch(() => setProductsError('Failed to load products'))
        .finally(() => setLoadingProducts(false));
    }
  }, [selectedCategory]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Products Section */}
      <div className="flex-1 p-2 sm:p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
          <div className="p-2 sm:p-4 border-b">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">Point of Sale</h1>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-2 sm:mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category, idx) => (
                  <option key={category._id || idx} value={category._id}>{category.name}</option>
                ))}
              </select>
              {categoriesError && (
                <div className="text-xs text-red-500 mt-1">{categoriesError}</div>
              )}
            </div>
            {/* Barcode Scanner */}
            <div className="mb-2 sm:mb-4">
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2 flex-col sm:flex-row">
                <div className="relative flex-1">
                  <Scan className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Scan or enter barcode..."
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      barcodeError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                    } text-sm sm:text-base`}
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={handleBarcodeKeyDown}
                  />
                  {barcodeError && (
                    <div className="absolute top-full left-0 mt-1 text-red-500 text-xs">
                      {barcodeError}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                >
                  Add
                </button>
              </form>
              <div className="text-xs text-gray-500 mt-1">
                Try: 1234567890123 (Coffee), 1234567890125 (Sandwich), 1234567890131 (Pizza)
              </div>
            </div>
          </div>
          {/* Products Grid */}
          <div className="p-2 sm:p-4 overflow-y-auto flex-1" style={{ minHeight: 0 }}>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6"
            >
              {loadingProducts ? (
                <div className="col-span-full text-center text-gray-500">Loading products...</div>
              ) : productsError ? (
                <div className="col-span-full text-center text-red-500">{productsError}</div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center text-gray-400">No products found.</div>
              ) : (
                filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 cursor-pointer flex flex-col items-center p-3 sm:p-5 group focus-within:ring-2 focus-within:ring-purple-500"
                    tabIndex={0}
                    aria-label={`Add ${product.name} to cart`}
                    onClick={() => addToCart(product)}
                    onKeyPress={e => { if (e.key === 'Enter') addToCart(product); }}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-gray-50 rounded-xl mb-2 sm:mb-3 text-4xl sm:text-5xl group-hover:bg-purple-50 transition-colors">
                      {product.image || '🛒'}
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 text-center truncate w-full" title={product.name}>{product.name}</h3>
                    <p className="text-purple-600 font-bold text-base sm:text-lg mb-0.5">${product.selling_price?.toFixed ? product.selling_price.toFixed(2) : product.selling_price}</p>
                    <p className="text-xs text-gray-500 mb-0.5">{product.category_name}</p>
                    <p className="text-xs text-gray-400 font-mono">{product.barcode}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Cart Section */}
      <div className="w-full md:w-96 bg-white shadow-2xl md:static fixed bottom-0 left-0 right-0 z-30 max-h-[60vh] md:max-h-none flex flex-col rounded-t-2xl md:rounded-none border-t md:border-t-0 border-gray-200">
        <div className="p-3 sm:p-5 border-b bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl md:rounded-none">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Order Summary</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '30vh', height: 'auto' }}>
          {cart.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-200" />
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 truncate" title={item.name}>{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.category_name}</p>
                    <p className="text-xs text-gray-400 font-mono">{item.barcode}</p>
                    <p className="text-purple-600 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 rounded-full bg-gray-200 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-base font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 rounded-full bg-gray-200 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 rounded-full bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-red-600 ml-2 transition-colors"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Customer Info & Payment */}
        <div className="border-t p-3 sm:p-5 space-y-2 sm:space-y-4 bg-white rounded-b-2xl md:rounded-none">
          <div>
            <label className="block text-sm font-medium mb-1">Customer Name (Optional)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={customerInfo.full_name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 p-2 border rounded flex items-center justify-center gap-2 ${
                  paymentMethod === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-50'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Card
              </button>
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 p-2 border rounded flex items-center justify-center gap-2 ${
                  paymentMethod === 'cash' ? 'bg-blue-500 text-white' : 'bg-gray-50'
                }`}
              >
                💵 Cash
              </button>
            </div>
          </div>
          {/* Totals */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-base font-medium">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-base text-red-600 font-semibold">
                <span>Discount ({discount.type === 'percentage' ? `${discount.value}%` : `${discount.value}`}):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base">
              <span>Tax (8%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-xl text-purple-700">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={openCheckout}
            disabled={cart.length === 0}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed mt-2"
            aria-label="Proceed to checkout"
          >
            Checkout (${total.toFixed(2)})
          </button>
        </div>
      </div>
      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-2 sm:p-6 max-w-full sm:max-w-md w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Checkout</h3>
              <button onClick={closeCheckout} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Customer Info */}
            <div className="mb-4 p-3 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Customer Information</h4>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerInfo({ full_name: 'Walk-in Customer', email: `cust${walkInCount}@gmail.com`, phone: '', tin: '' });
                      setWalkInCount(prev => prev + 1);
                    }}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Walk-in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerInfo({ full_name: '', email: `cust${walkInCount}@gmail.com`, phone: '', tin: '' });
                      setWalkInCount(prev => prev + 1);
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customerInfo.full_name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">TIN/Tax ID</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={customerInfo.tin}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, tin: e.target.value }))}
                      placeholder="123-45-6789"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email (For Digital Receipt)</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="customer@email.com"
                  />
                </div>
                {customerInfo.phone || customerInfo.email && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    💡 Receipt will be sent via {customerInfo.phone && customerInfo.email ? 'SMS & Email' : customerInfo.phone ? 'SMS' : 'Email'}
                  </div>
                )}
              </div>
            </div>
            {/* Discount Section */}
            <div className="mb-4 p-3 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">Apply Discount</h4>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setDiscount(prev => ({ ...prev, type: 'percentage' }))}
                  className={`px-3 py-1 text-sm rounded ${
                    discount.type === 'percentage' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  %
                </button>
                <button
                  onClick={() => setDiscount(prev => ({ ...prev, type: 'fixed' }))}
                  className={`px-3 py-1 text-sm rounded ${
                    discount.type === 'fixed' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  $
                </button>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={discount.type === 'percentage' ? '100' : subtotal.toString()}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  placeholder={discount.type === 'percentage' ? '0-100' : '0.00'}
                  value={discount.value || ''}
                  onChange={(e) => setDiscount(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              {discountAmount > 0 && (
                <div className="text-sm text-green-600">
                  Discount applied: -${discountAmount.toFixed(2)}
                </div>
              )}
            </div>
            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 p-2 border rounded flex items-center justify-center gap-2 ${
                    paymentMethod === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-50'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Card
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 p-2 border rounded flex items-center justify-center gap-2 ${
                    paymentMethod === 'cash' ? 'bg-blue-500 text-white' : 'bg-gray-50'
                  }`}
                >
                  💵 Cash
                </button>
              </div>
            </div>
            {/* Cash Handling */}
            {paymentMethod === 'cash' && (
              <div className="mb-4 p-3 border rounded-lg bg-yellow-50">
                <label className="block text-sm font-medium mb-1">Cash Received</label>
                <input
                  type="number"
                  min={total}
                  step="0.01"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                />
                {cashReceived && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Cash Received:</span>
                      <span className="font-medium">${cashReceivedNum.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Due:</span>
                      <span className="font-medium">${total.toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between font-bold ${
                      changeAmount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span>Change:</span>
                      <span>${changeAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Order Summary */}
            <div className="mb-4 p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-1">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              {/* QR Code Preview */}
              <div className="mt-3 p-2 bg-blue-50 rounded text-center">
                <div className="text-xs text-blue-700 mb-1">📱 Receipt will include QR code for:</div>
                <div className="text-xs text-blue-600">Digital receipt • Feedback • Returns • Loyalty</div>
              </div>
            </div>
            <button
              onClick={processPayment}
              disabled={paymentMethod === 'cash' && cashReceivedNum < total}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {paymentMethod === 'cash' && cashReceivedNum < total 
                ? `Need ${(total - cashReceivedNum).toFixed(2)} More`
                : `Complete Payment - ${total.toFixed(2)}`
              }
            </button>
          </div>
        </div>
      )}
      {/* Receipt Modal */}
      {showReceipt && currentTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-2 sm:p-6 max-w-full sm:max-w-md w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Transaction Complete</h3>
              </div>
              <button onClick={closeReceipt} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border-b pb-4 mb-4">
              <p className="text-sm text-gray-600">Transaction ID: {currentTransaction.id}</p>
              <p className="text-sm text-gray-600">{currentTransaction.timestamp}</p>
              {(currentTransaction.customer.full_name || currentTransaction.customer.phone || currentTransaction.customer.tin || currentTransaction.customer.email) && (
                <div className="mt-3 p-2 bg-gray-50 rounded">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Customer Details:</h5>
                  {currentTransaction.customer.full_name && (
                    <p className="text-sm text-gray-600">Name: {currentTransaction.customer.full_name}</p>
                  )}
                  {currentTransaction.customer.phone && (
                    <p className="text-sm text-gray-600">Phone: {currentTransaction.customer.phone}</p>
                  )}
                  {currentTransaction.customer.tin && (
                    <p className="text-sm text-gray-600">TIN: {currentTransaction.customer.tin}</p>
                  )}
                  {currentTransaction.customer.email && (
                    <p className="text-sm text-gray-600">Email: {currentTransaction.customer.email}</p>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2 mb-4">
              {currentTransaction.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            {/* QR Code Section */}
            <div className="border-t border-b py-4 mb-4 text-center bg-gray-50 rounded">
              <div className="mb-3">
                <img 
                  src={getQRCodeURL(generateQRCodeData(currentTransaction))}
                  alt="Transaction QR Code"
                  className="mx-auto border rounded shadow-sm"
                  style={{ width: '120px', height: '120px' }}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">📱 Scan QR Code for:</p>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>• Digital receipt & transaction details</p>
                  <p>• Customer feedback & review</p>
                  <p>• Return/exchange reference</p>
                  <p>• Store contact & loyalty program</p>
                </div>
              </div>
              <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded inline-block">
                Transaction: {currentTransaction.id}
              </div>
            </div>
            <div className="border-t pt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${currentTransaction.subtotal.toFixed(2)}</span>
              </div>
              {currentTransaction.discount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount:</span>
                  <span>-${currentTransaction.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${currentTransaction.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${currentTransaction.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Payment:</span>
                <span>{currentTransaction.paymentMethod === 'card' ? 'Card' : 'Cash'}</span>
              </div>
              {currentTransaction.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Cash Received:</span>
                    <span>${currentTransaction.cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-green-600">
                    <span>Change:</span>
                    <span>${currentTransaction.change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={closeReceipt}
              className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              New Transaction
            </button>
            {/* Receipt Actions */}
            {(currentTransaction.customer.phone || currentTransaction.customer.email) && (
              <div className="mt-3 flex gap-2">
                {currentTransaction.customer.phone && (
                  <button
                    onClick={() => alert(`SMS receipt sent to ${currentTransaction.customer.phone}`)}
                    className="flex-1 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                  >
                    📱 Send SMS
                  </button>
                )}
                {currentTransaction.customer.email && (
                  <button
                    onClick={() => alert(`Email receipt sent to ${currentTransaction.customer.email}`)}
                    className="flex-1 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    📧 Send Email
                  </button>
                )}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={() => {
                  const qrData = generateQRCodeData(currentTransaction);
                  navigator.clipboard?.writeText(qrData);
                  alert('QR code data copied to clipboard!');
                }}
                className="flex-1 py-2 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
              >
                📋 Copy QR Data
              </button>
            </div>
            <button
              onClick={() => {
                const qrData = generateQRCodeData(currentTransaction);
                alert(`QR Code contains:\n\n${JSON.stringify(JSON.parse(qrData), null, 2)}`);
              }}
              className="w-full mt-2 py-2 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100"
            >
              🔍 View QR Code Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSSystem; 