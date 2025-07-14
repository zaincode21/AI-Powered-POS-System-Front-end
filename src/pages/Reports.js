import React, { useState, useEffect } from 'react';
import { getSales } from '../services/saleService';
import { getProducts, getPriceHistory } from '../services/productService';
import { getSuppliers } from '../services/supplierService';
import { getSalesStats } from '../services/saleService';
import { getCustomers } from '../services/customerService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Add print styles at the top of the file
import './ReportsPrint.css';

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
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [salesPage, setSalesPage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [salesStartDate, setSalesStartDate] = useState('');
  const [salesEndDate, setSalesEndDate] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('All');
  const pageSize = 10;
  const salesTotalPagesFiltered = Math.ceil(filteredSales.length / pageSize);
  // Filter products by category
  const filteredProductsByCategory = inventoryCategory === 'All'
    ? products
    : products.filter(product => String(product.category_id) === String(inventoryCategory) || String(product.category) === String(inventoryCategory));
  const paginatedProducts = filteredProductsByCategory.slice((inventoryPage - 1) * pageSize, inventoryPage * pageSize);
  const inventoryTotalPagesFiltered = Math.ceil(filteredProductsByCategory.length / pageSize);

  // Filter sales by date range
  const filteredSalesByDate = filteredSales.filter(sale => {
    if (!salesStartDate && !salesEndDate) return true;
    const saleDate = sale.created_at ? new Date(sale.created_at) : null;
    if (!saleDate) return false;
    if (salesStartDate && saleDate < new Date(salesStartDate)) return false;
    if (salesEndDate && saleDate > new Date(salesEndDate + 'T23:59:59')) return false;
    return true;
  });
  const paginatedSales = filteredSalesByDate.slice((salesPage - 1) * pageSize, salesPage * pageSize);

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
    
    // Fetch customers
    getCustomers()
      .then(data => {
        // setCustomers(data); // Removed
      })
      .catch(err => {
        console.error('Failed to fetch customers:', err);
        // setCustomersError(err.message || 'Failed to fetch customers'); // Removed
      });
  }, []);

  useEffect(() => {
    setStatsLoading(true);
    getSalesStats()
      .then(data => setStats(data))
      .catch(err => setStatsError(err.message || 'Failed to fetch stats'))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    // Simulate loading
    setLoading(false);
  }, []);

  // Reset to page 1 when filters/data change
  useEffect(() => { setSalesPage(1); }, [filteredSales, salesStartDate, salesEndDate]);
  useEffect(() => { setInventoryPage(1); }, [products, inventoryCategory]);

  // Add helper function for CSV export
  function exportToCSV(data, columns, filename) {
    const csvRows = [columns.map(col => col.label).join(',')];
    for (const row of data) {
      csvRows.push(columns.map(col => {
        let val = typeof col.value === 'function' ? col.value(row) : row[col.value];
        if (typeof val === 'string') val = '"' + val.replace(/"/g, '""') + '"';
        return val;
      }).join(','));
    }
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- Export to PDF ---
  const handleExportSalesPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const now = new Date();
    const dateString = now.toLocaleString();
    function addHeader(title, description, y) {
      doc.setFontSize(18);
      doc.setTextColor(34, 34, 34);
      doc.text(title, margin, y);
      doc.setFontSize(11);
      doc.setTextColor(85, 85, 85);
      doc.text(dateString, margin, y + 18);
      doc.setFontSize(12);
      doc.setTextColor(68, 68, 68);
      doc.text(description, margin, y + 36);
      return y + 54;
    }
    function addFooter() {
      doc.setFontSize(13);
      doc.setTextColor(150, 150, 150);
      doc.text('POS Management system © Uruti hub', pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
    }
    let y = margin;
    // --- Sales Section Only ---
    const salesBody = filteredSalesByDate.map((sale, idx) => [
      idx + 1,
      sale.customer_name || '-',
      Array.isArray(sale.items) ? sale.items.map(i => i.product_name).join('; ') : '-',
      Array.isArray(sale.items) ? sale.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : '-',
      sale.created_at ? new Date(sale.created_at).toLocaleString() : '-',
      sale.total_amount?.toFixed ? sale.total_amount.toFixed(2) : sale.total_amount
    ]);
    const totalSalesQuantity = filteredSalesByDate.reduce((sum, sale) => sum + (Array.isArray(sale.items) ? sale.items.reduce((s, i) => s + (i.quantity || 0), 0) : 0), 0);
    const totalSalesAmount = filteredSalesByDate.reduce((sum, sale) => sum + (Number(sale.total_amount) || 0), 0);
    salesBody.push([
      { content: 'Total:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 243, 255] } },
      totalSalesQuantity,
      '',
      totalSalesAmount.toFixed(2)
    ]);
    y = addHeader('Sales Report', 'All sales transactions for the selected period.', y);
    autoTable(doc, {
      startY: y,
      head: [['No', 'Customer', 'Products', 'Quantities', 'Date', 'Total']],
      body: salesBody,
      didDrawPage: addFooter,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [124, 58, 237], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 243, 255] },
    });
    doc.save('sales_report.pdf');
  };

  const handleExportInventoryPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const now = new Date();
    const dateString = now.toLocaleString();
    function addHeader(title, description, y) {
      doc.setFontSize(18);
      doc.setTextColor(34, 34, 34);
      doc.text(title, margin, y);
      doc.setFontSize(11);
      doc.setTextColor(85, 85, 85);
      doc.text(dateString, margin, y + 18);
      doc.setFontSize(12);
      doc.setTextColor(68, 68, 68);
      doc.text(description, margin, y + 36);
      return y + 54;
    }
    function addFooter() {
      doc.setFontSize(13);
      doc.setTextColor(150, 150, 150);
      doc.text('POS Management system © USerge zaincode21', pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
    }
    let y = margin;
    // --- Inventory Section Only ---
    const inventoryBody = filteredProductsByCategory.map((product, idx) => [
      idx + 1,
      product.name,
      product.category_name || product.category || '-',
      product.current_stock || product.stock || 0,
      product.selling_price || product.price || '-',
      (() => {
        const currentStock = product.current_stock || product.stock || 0;
        if (currentStock <= 0) return 'Out-Stock';
        if (currentStock <= 40) return 'Low Stock';
        return 'In Stock';
      })(),
      product.supplier_name || '-',
      product.cost_price || '-',
      product.min_stock_level || 5,
      (() => {
        const productId = product._id || product.id;
        const history = priceHistory[productId];
        return history && history.created_at ? new Date(history.created_at).toLocaleDateString() : '-';
      })()
    ]);
    const totalInventoryStock = filteredProductsByCategory.reduce((sum, p) => sum + (p.current_stock || p.stock || 0), 0);
    const totalInventoryValue = filteredProductsByCategory.reduce((sum, p) => sum + ((Number(p.selling_price || p.price || 0)) * (p.current_stock || p.stock || 0)), 0);
    inventoryBody.push([
      { content: 'Total:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [236, 253, 245] } },
      totalInventoryStock,
      totalInventoryValue.toFixed(2),
      '', '', '', '', ''
    ]);
    y = addHeader('Inventory Report', 'Current inventory status and stock levels.', y);
    autoTable(doc, {
      startY: y,
      head: [['No', 'Product Name', 'Category', 'Current Stock', 'Current Price', 'Stock Status', 'Supplier', 'Cost Price', 'Min Stock Level', 'Last Price Change']],
      body: inventoryBody,
      didDrawPage: addFooter,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      alternateRowStyles: { fillColor: [236, 253, 245] },
    });
    doc.save('inventory_report.pdf');
  };

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

  function printSection(tableId, title, description) {
    console.log('printSection called with:', tableId, title, description);
    const table = document.getElementById(tableId);
    if (!table) {
      alert('Could not find the table to print.');
      console.error('Table not found:', tableId);
      return;
    }
    let printWindow;
    try {
      printWindow = window.open('', '', 'width=900,height=700');
      if (!printWindow) {
        alert('Popup was blocked! Please allow popups for this site.');
        console.error('Popup blocked by browser.');
        return;
      }
      const now = new Date();
      const dateString = now.toLocaleString();
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #000; margin: 0; padding: 2rem; }
              .report-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; color: #222; }
              .report-date { font-size: 1rem; color: #555; margin-bottom: 0.5rem; }
              .report-desc { font-size: 1.05rem; color: #444; margin-bottom: 1.2rem; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 2.5rem; font-size: 1rem; background: #fff; box-shadow: 0 2px 8px #0001; }
              th, td { border: 1px solid #333; padding: 8px 10px; text-align: left; background: #fff; }
              thead th { background: #f5f5f5; font-weight: bold; color: #222; }
              tr { page-break-inside: avoid; }
              /* Print footer/watermark */
              .print-footer {
                position: fixed;
                bottom: 1cm;
                left: 0;
                right: 0;
                text-align: center;
                opacity: 0.2;
                font-size: 1.3rem;
                pointer-events: none;
                z-index: 9999;
                font-weight: bold;
                letter-spacing: 1px;
              }
            </style>
          </head>
          <body>
            <div class="report-title">${title}</div>
            <div class="report-date">${dateString}</div>
            <div class="report-desc">${description}</div>
            ${table.outerHTML}
            <div class="this code is coded by:&copy;Serge zaincode21</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        console.log('Print window opened and print triggered.');
      }, 300);
    } catch (err) {
      alert('An error occurred while trying to print. See console for details.');
      console.error('Error in printSection:', err);
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-50 reports-main">
      <h1 className="print-report-title text-2xl font-bold text-gray-800 mb-2" style={{ textAlign: 'center', marginBottom: 32 }}>Professional Report</h1>
      {/* Header */}
      <div className="mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center sm:text-left">Reports</h1>
        <p className="text-gray-500 text-center sm:text-left">View and analyze your business performance.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statsLoading ? (
          <div className="col-span-4 flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : statsError ? (
          <div className="col-span-4 text-center text-red-600">{statsError}</div>
        ) : stats ? (
          <>
            <div className="flex flex-col items-center bg-white rounded-lg shadow p-4 min-w-[140px]">
              <span className="text-3xl mb-2">💰</span>
              <span className="text-xl font-bold">RWF{Math.round(Number(stats.todaySales)).toLocaleString()}</span>
              <span className="text-gray-500 text-sm text-center">Today's Sales</span>
            </div>
            <div className="flex flex-col items-center bg-white rounded-lg shadow p-4 min-w-[140px]">
              <span className="text-3xl mb-2">🧑‍🤝‍🧑</span>
              <span className="text-xl font-bold">{stats.totalCustomers}</span>
              <span className="text-gray-500 text-sm text-center">Total Customers</span>
            </div>
            <div className="flex flex-col items-center bg-white rounded-lg shadow p-4 min-w-[140px]">
              <span className="text-3xl mb-2">📦</span>
              <span className="text-xl font-bold">RWF{Math.round(Number(stats.inventoryValue)).toLocaleString()}</span>
              <span className="text-gray-500 text-sm text-center">Inventory Value</span>
            </div>
            <div className="flex flex-col items-center bg-white rounded-lg shadow p-4 min-w-[140px]">
              <span className="text-3xl mb-2">⚠️</span>
              <span className="text-xl font-bold">{stats.lowStockCount}</span>
              <span className="text-gray-500 text-sm text-center">Low Stock Items</span>
            </div>
            <div className="flex flex-col items-center bg-white rounded-lg shadow p-4 min-w-[140px]">
              <span className="text-3xl mb-2">🏆</span>
              <span className="text-xl font-bold">{stats.bestSeller}</span>
              <span className="text-gray-500 text-sm text-center">Best Seller (30d)</span>
            </div>
          </>
        ) : null}
      </div>
      <div className="border-b-2 border-purple-200 my-8"></div>
    

      {/* Data Tables */}
      <div className="no-print mb-4 text-center text-xs text-gray-500">
        <span>
          <strong>Tip:</strong> For best results, enable <em>Print Background Colors and Images</em> in your browser’s print dialog.
        </span>
      </div>
      <div className="mb-12 print-table-section" id="sales-table-section">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Sales</h2>
        <div className="bg-white shadow rounded-xl p-4 overflow-x-auto border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center justify-between w-full no-print ">
            <div className="flex gap-2 items-center  ">
              <label className="text-sm font-medium">Date Range:</label>
              <input type="date" value={salesStartDate} onChange={e => setSalesStartDate(e.target.value)} className="border rounded px-2 py-1" />
              <span className="mx-1">to</span>
              <input type="date" value={salesEndDate} onChange={e => setSalesEndDate(e.target.value)} className="border rounded px-2 py-1" />
              <button onClick={() => { setSalesStartDate(''); setSalesEndDate(''); }} className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs">Clear</button>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => exportToCSV(filteredSalesByDate, [
                  { label: 'Customer', value: 'customer_name' },
                  { label: 'Products', value: row => Array.isArray(row.items) ? row.items.map(i => i.product_name).join('; ') : '-' },
                  { label: 'Quantities', value: row => Array.isArray(row.items) ? row.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : '-' },
                  { label: 'Date', value: row => row.created_at ? new Date(row.created_at).toLocaleString() : '-' },
                  { label: 'Total', value: row => row.total_amount?.toFixed ? row.total_amount.toFixed(2) : row.total_amount }
                ], 'sales_report.csv')}
                className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
              >Export CSV</button>
              <button
                onClick={() => printSection('sales-table', 'Sales Report', 'All sales transactions for the selected period.')}
                className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 text-xs"
              >Print</button>
              <button
                onClick={handleExportSalesPDF}
                className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-xs"
              >Export PDF</button>
            </div>
          </div>
          <table id="sales-table" className="min-w-[600px] w-full text-sm">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-purple-700">No</th>
                {/* <th className="px-3 py-2 text-left font-semibold text-purple-700">Sale Number</th> */}
                <th className="px-3 py-2 text-left font-semibold text-purple-700">Customer</th>
                <th className="px-3 py-2 text-left font-semibold text-purple-700">Products</th>
                <th className="px-3 py-2 text-left font-semibold text-purple-700">Quantities</th>
                <th className="px-3 py-2 text-left font-semibold text-purple-700">Date</th>
                <th className="px-3 py-2 text-left font-semibold text-purple-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-gray-400 py-6">No sales data available.</td>
                </tr>
              ) : (
                paginatedSales.map((sale, idx) => (
                  <tr key={sale.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50 hover:bg-purple-100'}>
                    <td className="border px-3 py-2">{(salesPage - 1) * pageSize + idx + 1}</td>
                    {/* <td className="border px-3 py-2">{sale.sale_number || sale.id}</td> */}
                    <td className="border px-3 py-2">{sale.customer_name || '-'}</td>
                    <td className="border px-3 py-2">{Array.isArray(sale.items) ? sale.items.map(i => i.product_name).join(', ') : '-'}</td>
                    <td className="border px-3 py-2">{Array.isArray(sale.items) ? sale.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : '-'}</td>
                    <td className="border px-3 py-2">{sale.created_at ? new Date(sale.created_at).toLocaleString() : '-'}</td>
                    <td className="border px-3 py-2">RWF{sale.total_amount?.toFixed ? sale.total_amount.toFixed(2) : sale.total_amount}</td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Sales Table Footer for Totals */}
            <tfoot>
              <tr className="bg-purple-100 font-semibold">
                <td className="border px-3 py-2 text-right" colSpan={3}>Total (Page):</td>
                <td className="border px-3 py-2">
                  {paginatedSales.reduce((sum, sale) => sum + (Array.isArray(sale.items) ? sale.items.reduce((s, i) => s + (i.quantity || 0), 0) : 0), 0)}
                </td>
                <td className="border px-3 py-2"></td>
                <td className="border px-3 py-2">
                  RWF{paginatedSales.reduce((sum, sale) => sum + (Number(sale.total_amount) || 0), 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-2 mt-4 w-full no-print">
            <button
              onClick={() => setSalesPage(p => Math.max(1, p - 1))}
              disabled={salesPage === 1}
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium">
              Page {salesPage} of {salesTotalPagesFiltered}
            </span>
            <button
              onClick={() => setSalesPage(p => Math.min(salesTotalPagesFiltered, p + 1))}
              disabled={salesPage === salesTotalPagesFiltered}
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* In the Inventory table section, update the table structure: */}
      <div className="mb-12 print-table-section" id="inventory-table-section">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Inventory</h2>
        <div className="bg-white shadow rounded-xl p-4 overflow-x-auto border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center justify-between w-full no-print">
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">Category:</label>
              <select value={inventoryCategory} onChange={e => setInventoryCategory(e.target.value)} className="border rounded px-2 py-1">
                <option value="All">All</option>
                {Array.isArray(products) && products.map(p => p.category_id && p.category_name ? { id: p.category_id, name: p.category_name } : null)
                  .filter((cat, idx, arr) => cat && arr.findIndex(c => c && c.id === cat.id) === idx)
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
              </select>
              <button onClick={() => setInventoryCategory('All')} className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs">Clear</button>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => exportToCSV(filteredProductsByCategory, [
                  { label: 'Product Name', value: 'name' },
                  { label: 'Category', value: row => row.category_name || row.category || '-' },
                  { label: 'Current Stock', value: row => row.current_stock || row.stock || 0 },
                  { label: 'Current Price', value: row => row.selling_price || row.price || '-' },
                  { label: 'Stock Status', value: row => {
                    const currentStock = row.current_stock || row.stock || 0;
                    if (currentStock <= 0) return 'Out-Stock';
                    if (currentStock <= 40) return 'Low Stock';
                    return 'In Stock';
                  } },
                  { label: 'Supplier', value: row => row.supplier_name || '-' },
                  { label: 'Cost Price', value: row => row.cost_price || '-' },
                  { label: 'Min Stock Level', value: row => row.min_stock_level || 5 },
                  { label: 'Last Price Change', value: row => {
                    const productId = row._id || row.id;
                    const history = priceHistory[productId];
                    return history && history.created_at ? new Date(history.created_at).toLocaleDateString() : '-';
                  } }
                ], 'inventory_report.csv')}
                className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
              >Export CSV</button>
              <button
                onClick={() => printSection('inventory-table', 'Inventory Report', 'Current inventory status and stock levels.')}
                className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 text-xs"
              >Print</button>
              <button
                onClick={handleExportInventoryPDF}
                className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-xs"
              >Export PDF</button>
            </div>
          </div>
          <table id="inventory-table" className="min-w-[900px] w-full text-sm">
            <thead className="bg-green-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-green-700">No</th>
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
                <tr><td colSpan={10} className="text-center text-gray-400 py-6">Loading products...</td></tr>
              ) : productsError ? (
                <tr><td colSpan={10} className="text-center text-red-500 py-6">{productsError}</td></tr>
              ) : paginatedProducts.length === 0 ? (
                <tr><td colSpan={10} className="text-center text-gray-400 py-6">No product data available.</td></tr>
              ) : (
                paginatedProducts.map((product, idx) => {
                  const rowNo = (inventoryPage - 1) * pageSize + idx + 1;
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
                      <td className="border px-3 py-2">{rowNo}</td>
                      <td className="border px-3 py-2">{product.name}</td>
                      <td className="border px-3 py-2">{product.category_name || product.category || '-'}</td>
                      <td className="border px-3 py-2">{currentStock}</td>
                      <td className="border px-3 py-2">RWF{Math.round(Number(product.selling_price || product.price || 0)).toLocaleString()}</td>
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
                      <td className="border px-3 py-2">RWF{Math.round(Number(product.cost_price || 0)).toLocaleString()}</td>
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
            {/* Inventory Table Footer for Totals */}
            <tfoot>
              <tr className="bg-green-100 font-semibold">
                <td className="border px-3 py-2 text-right" colSpan={3}>Total (Page):</td>
                <td className="border px-3 py-2">
                  {paginatedProducts.reduce((sum, p) => sum + (p.current_stock || p.stock || 0), 0)}
                </td>
                <td className="border px-3 py-2">
                  RWF{Math.round(paginatedProducts.reduce((sum, p) => sum + ((Number(p.selling_price || p.price || 0)) * (p.current_stock || p.stock || 0)), 0)).toLocaleString()}
                </td>
                <td className="border px-3 py-2" colSpan={5}></td>
              </tr>
            </tfoot>
          </table>
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-2 mt-4 w-full no-print">
            <button
              onClick={() => setInventoryPage(p => Math.max(1, p - 1))}
              disabled={inventoryPage === 1}
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium">
              Page {inventoryPage} of {inventoryTotalPagesFiltered}
            </span>
            <button
              onClick={() => setInventoryPage(p => Math.min(inventoryTotalPagesFiltered, p + 1))}
              disabled={inventoryPage === inventoryTotalPagesFiltered}
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <div className="mb-12 print-table-section" id="suppliers-table-section">
        <h2 className="text-2xl font-bold mb-4 text-yellow-700">Suppliers</h2>
        <div className="bg-white shadow rounded-xl p-4 overflow-x-auto border border-gray-100">
          <table id="suppliers-table" className="min-w-[500px] w-full text-sm">
            <thead className="bg-yellow-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-yellow-700">No</th>
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
                    <td className="border px-3 py-2">{idx + 1}</td>
                    <td className="border px-3 py-2">{supplier.name}</td>
                    <td className="border px-3 py-2">{supplier.email || '-'}</td>
                    <td className="border px-3 py-2">{supplier.phone || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="flex gap-2 mt-2 sm:mt-0 no-print">
            <button
              onClick={() => printSection('suppliers-table', 'Suppliers Report', 'List of all registered suppliers.')}
              className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 text-xs"
            >Print</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports; 