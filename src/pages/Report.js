import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Set default Authorization header for all axios requests
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const Report = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/report';
      const params = [];
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      if (params.length) url += `?${params.join('&')}`;
      const res = await axios.get(url);
      setReport(res.data);
    } catch (err) {
      setError('Failed to fetch report');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const downloadFile = (type) => {
    let url = `/api/report/${type}`;
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length) url += `?${params.join('&')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Professional Report</h1>
      <form className="mb-4 flex gap-2 items-end" onSubmit={handleFilter}>
        <div>
          <label className="block text-sm">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Filter</button>
        <button type="button" className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => downloadFile('pdf')}>Download PDF</button>
        <button type="button" className="bg-yellow-500 text-white px-4 py-2 rounded" onClick={() => downloadFile('excel')}>Download Excel</button>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {report && (
        <div className="space-y-8">
          {/* Sales Summary */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Sales Summary</h2>
            <div>Total Sales: {report.sales.totalSales}</div>
            <div>Total Revenue: ${report.sales.totalRevenue.toFixed(2)}</div>
            <div>Total Tax: ${report.sales.totalTax.toFixed(2)}</div>
            <div>Total Discount: ${report.sales.totalDiscount.toFixed(2)}</div>
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Sale #</th>
                    <th className="border px-2 py-1">Customer</th>
                    <th className="border px-2 py-1">User</th>
                    <th className="border px-2 py-1">Store</th>
                    <th className="border px-2 py-1">Total</th>
                    <th className="border px-2 py-1">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {report.sales.details.slice(0, 10).map(sale => (
                    <tr key={sale.id}>
                      <td className="border px-2 py-1">{sale.sale_number}</td>
                      <td className="border px-2 py-1">{sale.customer_name}</td>
                      <td className="border px-2 py-1">{sale.user_name}</td>
                      <td className="border px-2 py-1">{sale.store_name}</td>
                      <td className="border px-2 py-1">${sale.total_amount}</td>
                      <td className="border px-2 py-1">{new Date(sale.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.sales.details.length > 10 && <div className="text-xs">Showing 10 of {report.sales.details.length} sales...</div>}
            </div>
          </section>
          {/* Products Summary */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Inventory Summary</h2>
            <div>Total Products: {report.products.totalProducts}</div>
            <div>Low Stock Products: {report.products.lowStockCount}</div>
            {report.products.lowStockProducts.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold">Low Stock List:</div>
                <ul className="list-disc ml-6">
                  {report.products.lowStockProducts.slice(0, 10).map(p => (
                    <li key={p.id}>{p.name} (Stock: {p.current_stock}, Min: {p.min_stock_level})</li>
                  ))}
                  {report.products.lowStockProducts.length > 10 && <li>...</li>}
                </ul>
              </div>
            )}
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Category</th>
                    <th className="border px-2 py-1">Supplier</th>
                    <th className="border px-2 py-1">Stock</th>
                    <th className="border px-2 py-1">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {report.products.details.slice(0, 10).map(p => (
                    <tr key={p.id}>
                      <td className="border px-2 py-1">{p.name}</td>
                      <td className="border px-2 py-1">{p.category_name}</td>
                      <td className="border px-2 py-1">{p.supplier_name}</td>
                      <td className="border px-2 py-1">{p.current_stock}</td>
                      <td className="border px-2 py-1">${p.selling_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.products.details.length > 10 && <div className="text-xs">Showing 10 of {report.products.details.length} products...</div>}
            </div>
          </section>
          {/* Customers Summary */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Customers Summary</h2>
            <div>Total Customers: {report.customers.totalCustomers}</div>
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Email</th>
                    <th className="border px-2 py-1">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {report.customers.details.slice(0, 10).map(c => (
                    <tr key={c.id}>
                      <td className="border px-2 py-1">{c.full_name}</td>
                      <td className="border px-2 py-1">{c.email}</td>
                      <td className="border px-2 py-1">{c.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.customers.details.length > 10 && <div className="text-xs">Showing 10 of {report.customers.details.length} customers...</div>}
            </div>
          </section>
          {/* Suppliers Summary */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Suppliers Summary</h2>
            <div>Total Suppliers: {report.suppliers.totalSuppliers}</div>
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Contact</th>
                    <th className="border px-2 py-1">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {report.suppliers.details.slice(0, 10).map(sup => (
                    <tr key={sup.id}>
                      <td className="border px-2 py-1">{sup.name}</td>
                      <td className="border px-2 py-1">{sup.contact_person}</td>
                      <td className="border px-2 py-1">{sup.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.suppliers.details.length > 10 && <div className="text-xs">Showing 10 of {report.suppliers.details.length} suppliers...</div>}
            </div>
          </section>
          {/* Users Summary */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Users Summary</h2>
            <div>Total Users: {report.users.totalUsers}</div>
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Full Name</th>
                    <th className="border px-2 py-1">Username</th>
                    <th className="border px-2 py-1">Email</th>
                    <th className="border px-2 py-1">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {report.users.details.slice(0, 10).map(u => (
                    <tr key={u.id}>
                      <td className="border px-2 py-1">{u.full_name}</td>
                      <td className="border px-2 py-1">{u.username}</td>
                      <td className="border px-2 py-1">{u.email}</td>
                      <td className="border px-2 py-1">{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.users.details.length > 10 && <div className="text-xs">Showing 10 of {report.users.details.length} users...</div>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Report; 