import React, { useState, useEffect } from 'react';
import { getSales } from '../services/saleService';
import { getProducts, getPriceHistory } from '../services/productService';
import { getSuppliers } from '../services/supplierService';

function Reports() {
  // In a real app, fetch data here
  const [loading, setLoading] = useState(false);

  // Remove placeholder arrays for filteredSales, products, suppliers
  const [filteredSales, setFilteredSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [suppliersError, setSuppliersError] = useState(null);

  const [priceHistory, setPriceHistory] = useState({});
  const [priceHistoryLoading, setPriceHistoryLoading] = useState({});

  useEffect(() => {
    // Fetch sales
    setLoading(true); // Changed from setSalesLoading(true)
    getSales()
      .then(data => setFilteredSales(data))
      .catch(err => {
        console.error('Failed to fetch sales:', err);
        // setSalesError(err.message || 'Failed to fetch sales'); // Removed
      })
      .finally(() => setLoading(false)); // Changed from setSalesLoading(false)
    
    // Fetch products
    setProductsLoading(true);
    getProducts()
      .then(data => {
        setProducts(data);
        // Fetch price history for each product
        data.forEach(product => {
          const productId = product._id || product.id;
          if (productId) {
            setPriceHistoryLoading(prev => ({ ...prev, [productId]: true }));
            getPriceHistory(productId)
              .then(history => {
                setPriceHistory(prev => ({ 
                  ...prev, 
                  [productId]: history.length > 0 ? history[0] : null 
                }));
              })
              .catch(err => {
                console.error(`Failed to fetch price history for product ${productId}:`, err);
                setPriceHistory(prev => ({ ...prev, [productId]: null }));
              })
              .finally(() => {
                setPriceHistoryLoading(prev => ({ ...prev, [productId]: false }));
              });
          }
        });
      })
      .catch(err => setProductsError(err.message || 'Failed to fetch products'))
      .finally(() => setProductsLoading(false));
    
    // Fetch suppliers
    setSuppliersLoading(true);
    getSuppliers()
      .then(data => setSuppliers(data))
      .catch(err => setSuppliersError(err.message || 'Failed to fetch suppliers'))
      .finally(() => setSuppliersLoading(false));
  }, []);

  useEffect(() => {
    // Simulate loading
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (productsError) { // Changed from error to productsError
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">{productsError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-0 sm:p-2 md:p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Reports</h1>
        <p className="text-gray-500">View and analyze your business performance.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Placeholder for Summary Cards */}
        <div key="Total Sales" className="flex flex-col items-center bg-white rounded-lg shadow p-4">
          <span className="text-3xl mb-2">💰</span>
          <span className="text-xl font-bold">$12,340</span>
          <span className="text-gray-500 text-sm text-center">Total Sales</span>
        </div>
        <div key="Total Transactions" className="flex flex-col items-center bg-white rounded-lg shadow p-4">
          <span className="text-3xl mb-2">🧾</span>
          <span className="text-xl font-bold">234</span>
          <span className="text-gray-500 text-sm text-center">Total Transactions</span>
        </div>
        <div key="Top Product" className="flex flex-col items-center bg-white rounded-lg shadow p-4">
          <span className="text-3xl mb-2">🏆</span>
          <span className="text-xl font-bold">Coffee Beans</span>
          <span className="text-gray-500 text-sm text-center">Top Product</span>
        </div>
        <div key="Total Customers" className="flex flex-col items-center bg-white rounded-lg shadow p-4">
          <span className="text-3xl mb-2">🧑‍🤝‍🧑</span>
          <span className="text-xl font-bold">120</span>
          <span className="text-gray-500 text-sm text-center">Total Customers</span>
        </div>
      </div>
      <div className="border-b-2 border-purple-200 my-8"></div>
      {/* Sales Report Table */}
      {/* <div className="bg-white rounded-xl shadow p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Sales Report</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-purple-50">
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3 px-3 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold">Customer</th>
                <th className="py-3 px-3 font-semibold">Items</th>
                <th className="py-3 px-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {salesLoading ? (
                <tr><td colSpan={8} className="text-center text-gray-400 py-6">Loading sales...</td></tr>
              ) : salesError ? (
                <tr><td colSpan={8} className="text-center text-red-500 py-6">{salesError}</td></tr>
              ) : filteredSales.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-gray-400 py-6">No sales data available.</td></tr>
              ) : (
                filteredSales.map((sale, idx) => (
                  <tr key={sale.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50 hover:bg-purple-100'}>
                    <td className="border px-3 py-2">{sale.sale_number || sale.id}</td>
                    <td className="border px-3 py-2">{sale.customer_name || '-'}</td>
                    <td className="border px-3 py-2">{Array.isArray(sale.items) ? sale.items.map(i => i.product_name).join(', ') : '-'}</td>
                    <td className="border px-3 py-2">{Array.isArray(sale.items) ? sale.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : '-'}</td>
                    <td className="border px-3 py-2">{sale.created_at ? new Date(sale.created_at).toLocaleString() : '-'}</td>
                    <td className="border px-3 py-2">${sale.total_amount?.toFixed ? sale.total_amount.toFixed(2) : sale.total_amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div> */}

      {/* Placeholder for Charts */}
      {/* <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Sales Chart (Coming Soon)</h2>
        <div className="flex items-center justify-center h-40 text-gray-400">
          <span>Chart visualization will be here.</span>
        </div>
      </div> */}
     
      {/* Data Tables */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Sales</h2>
        <div className="bg-white shadow rounded-xl p-4 overflow-x-auto border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-purple-50">
              <tr>
                {/* <th className="px-3 py-2 text-left font-semibold text-purple-700">Sale Number</th> */}
                <th className="px-3 py-2 text-left font-semibold text-purple-700">Customer</th>
                <th className="px-3 py-2 text-left font-semibold text-purple-700">Products</th>
                <th className="px-3 py-2 text-left font-semibold text-purple-700">Quantities</th>
                <th className="px-3 py-2 text-left font-semibold text-purple-700">Date</th>
                <th className="px-3 py-2 text-left font-semibold text-purple-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-6">No sales data available.</td>
                </tr>
              ) : (
                filteredSales.map((sale, idx) => (
                  <tr key={sale.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50 hover:bg-purple-100'}>
                    {/* <td className="border px-3 py-2">{sale.sale_number || sale.id}</td> */}
                    <td className="border px-3 py-2">{sale.customer_name || '-'}</td>
                    <td className="border px-3 py-2">{Array.isArray(sale.items) ? sale.items.map(i => i.product_name).join(', ') : '-'}</td>
                    <td className="border px-3 py-2">{Array.isArray(sale.items) ? sale.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : '-'}</td>
                    <td className="border px-3 py-2">{sale.created_at ? new Date(sale.created_at).toLocaleString() : '-'}</td>
                    <td className="border px-3 py-2">${sale.total_amount?.toFixed ? sale.total_amount.toFixed(2) : sale.total_amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* In the Inventory table section, update the table structure: */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Inventory</h2>
        <div className="bg-white shadow rounded-xl p-4 overflow-x-auto border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-green-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-green-700">Product Name</th>
                <th className="px-3 py-2 text-left font-semibold text-green-700">Category</th>
                <th className="px-3 py-2 text-left font-semibold text-green-700">Current Stock</th>
                <th className="px-3 py-2 text-left font-semibold text-green-700">Current Price</th>
                <th className="px-3 py-2 text-left font-semibold text-green-700">Stock Status</th>
                <th className="px-3 py-2 text-left font-semibold text-green-700">Supplier</th>
                <th className="px-3 py-2 text-left font-semibold text-green-700">Cost Price</th>
                <th className="px-3 py-2 text-left font-semibold text-green-700">Min Stock Level</th>
                <th className="px-3 py-2 text-left font-semibold text-green-700">Last Price Change</th>
              </tr>
            </thead>
            <tbody>
              {productsLoading ? (
                <tr><td colSpan={9} className="text-center text-gray-400 py-6">Loading products...</td></tr>
              ) : productsError ? (
                <tr><td colSpan={9} className="text-center text-red-500 py-6">{productsError}</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-gray-400 py-6">No product data available.</td></tr>
              ) : (
                products.map((product, idx) => {
                  // Calculate stock status
                  const currentStock = product.current_stock || product.stock || 0;
                  const minStockLevel = product.min_stock_level || 5;
                  let stockStatus = 'In Stock';
                  if (currentStock <= 0) {
                    stockStatus = 'Out-Stock';
                  } else if (currentStock <= 40) {
                    stockStatus = 'Low Stock';
                  }
                  
                  return (
                    <tr key={product._id || product.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-green-50 hover:bg-green-100'}>
                      <td className="border px-3 py-2">{product.name}</td>
                      <td className="border px-3 py-2">{product.category_name || product.category || '-'}</td>
                      <td className="border px-3 py-2">{currentStock}</td>
                      <td className="border px-3 py-2">${product.selling_price || product.price || '-'}</td>
                      <td className="border px-3 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stockStatus === 'Out-Stock' ? 'bg-red-100 text-red-800' :
                          stockStatus === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {stockStatus}
                        </span>
                      </td>
                      <td className="border px-3 py-2">{product.supplier_name || '-'}</td>
                      <td className="border px-3 py-2">${product.cost_price || '-'}</td>
                      <td className="border px-3 py-2">{minStockLevel}</td>
                      <td className="border px-3 py-2">
                        {(() => {
                          const productId = product._id || product.id;
                          if (!productId) return '-';
                          
                          if (priceHistoryLoading[productId]) {
                            return <span className="text-gray-400">Loading...</span>;
                          }
                          
                          const history = priceHistory[productId];
                          if (!history) return '-';
                          
                          return history.created_at ? new Date(history.created_at).toLocaleDateString() : '-';
                        })()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-yellow-700">Suppliers</h2>
        <div className="bg-white shadow rounded-xl p-4 overflow-x-auto border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-yellow-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-yellow-700">ID</th>
                <th className="px-3 py-2 text-left font-semibold text-yellow-700">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-yellow-700">Email</th>
                <th className="px-3 py-2 text-left font-semibold text-yellow-700">Phone</th>
              </tr>
            </thead>
            <tbody>
              {suppliersLoading ? (
                <tr><td colSpan={4} className="text-center text-gray-400 py-6">Loading suppliers...</td></tr>
              ) : suppliersError ? (
                <tr><td colSpan={4} className="text-center text-red-500 py-6">{suppliersError}</td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-400 py-6">No supplier data available.</td></tr>
              ) : (
                suppliers.map((supplier, idx) => (
                  <tr key={supplier._id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-yellow-50 hover:bg-yellow-100'}>
                    <td className="border px-3 py-2">{supplier._id}</td>
                    <td className="border px-3 py-2">{supplier.name}</td>
                    <td className="border px-3 py-2">{supplier.email || '-'}</td>
                    <td className="border px-3 py-2">{supplier.phone || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports; 