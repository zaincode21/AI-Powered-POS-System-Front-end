import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Reports() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSale, setExpandedSale] = useState(null);
  const [saleItems, setSaleItems] = useState({}); // { saleId: [items] }
  const [loadingItems, setLoadingItems] = useState({}); // { saleId: true/false }

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/sales/recent');
        setSales(res.data);
      } catch (err) {
        setError('Failed to fetch sales report');
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const handleExpand = async (sale) => {
    if (expandedSale === sale.sale_number) {
      setExpandedSale(null);
      return;
    }
    setExpandedSale(sale.sale_number);
    if (!saleItems[sale.sale_number]) {
      setLoadingItems((prev) => ({ ...prev, [sale.sale_number]: true }));
      try {
        // Fetch sale items for this sale
        const res = await axios.get(`/api/sales/${sale.sale_number}/items`);
        setSaleItems((prev) => ({ ...prev, [sale.sale_number]: res.data }));
      } catch {
        setSaleItems((prev) => ({ ...prev, [sale.sale_number]: 'error' }));
      } finally {
        setLoadingItems((prev) => ({ ...prev, [sale.sale_number]: false }));
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Sales Report</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border"></th>
                <th className="px-4 py-2 border">Sale Number</th>
                <th className="px-4 py-2 border">Customer</th>
                <th className="px-4 py-2 border">Total Amount</th>
                <th className="px-4 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, idx) => (
                <React.Fragment key={idx}>
                  <tr>
                    <td className="px-2 py-2 border text-center">
                      <button
                        className="text-purple-600 hover:underline"
                        onClick={() => handleExpand(sale)}
                        title={expandedSale === sale.sale_number ? 'Hide items' : 'Show items'}
                      >
                        {expandedSale === sale.sale_number ? '-' : '+'}
                      </button>
                    </td>
                    <td className="px-4 py-2 border">{sale.sale_number}</td>
                    <td className="px-4 py-2 border">{sale.customer_name}</td>
                    <td className="px-4 py-2 border">${sale.total_amount}</td>
                    <td className="px-4 py-2 border">{new Date(sale.created_at).toLocaleString()}</td>
                  </tr>
                  {expandedSale === sale.sale_number && (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 border bg-gray-50">
                        {loadingItems[sale.sale_number] ? (
                          <div>Loading sale items...</div>
                        ) : saleItems[sale.sale_number] === 'error' ? (
                          <div className="text-red-600">Failed to load sale items.</div>
                        ) : (
                          <div>
                            <h2 className="font-semibold mb-2">Sale Items</h2>
                            {saleItems[sale.sale_number] && saleItems[sale.sale_number].length > 0 ? (
                              <table className="min-w-full bg-white border border-gray-200 mb-2">
                                <thead>
                                  <tr>
                                    <th className="px-2 py-1 border">Product Name</th>
                                    <th className="px-2 py-1 border">SKU</th>
                                    <th className="px-2 py-1 border">Barcode</th>
                                    <th className="px-2 py-1 border">Quantity</th>
                                    <th className="px-2 py-1 border">Unit Price</th>
                                    <th className="px-2 py-1 border">Discount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {saleItems[sale.sale_number].map((item, i) => (
                                    <tr key={i}>
                                      <td className="px-2 py-1 border">{item.product_name}</td>
                                      <td className="px-2 py-1 border">{item.product_sku}</td>
                                      <td className="px-2 py-1 border">{item.product_barcode}</td>
                                      <td className="px-2 py-1 border">{item.quantity}</td>
                                      <td className="px-2 py-1 border">${item.unit_price}</td>
                                      <td className="px-2 py-1 border">${item.discount_amount}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div>No sale items found for this sale.</div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Reports; 