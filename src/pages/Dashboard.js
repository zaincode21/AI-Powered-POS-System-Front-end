import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { getSalesStats, getSales } from '../services/saleService';
import { getInventoryData } from '../services/productService';

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerPerDayData, setCustomerPerDayData] = useState([]);
  const [customerPerSaleData, setCustomerPerSaleData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [statsData, inventoryData, allSales] = await Promise.all([
          getSalesStats(),
          getInventoryData(),
          getSales(),
        ]);

        // Transform statsData object into an array for rendering
        setStats([
          { label: "Today's Sales", value: `RWF${Math.round(Number(statsData.todaySales)).toLocaleString()}`, icon: "💰" },
          { label: "Total Customers", value: statsData.totalCustomers, icon: "🧑‍🤝‍🧑" },
          { label: "Inventory Value", value: `RWF${Math.round(Number(statsData.inventoryValue)).toLocaleString()}`, icon: "📦" },
          { label: "Low Stock Items", value: statsData.lowStockCount, icon: "⚠️" },
          { label: "Best Seller", value: statsData.bestSeller, icon: "🏆" }
        ]);
        setInventory(inventoryData);
        // Aggregate sales by product
        const productSales = {};
        allSales.forEach(sale => {
          if (Array.isArray(sale.items)) {
            sale.items.forEach(item => {
              if (!item.product_name) return;
              if (!productSales[item.product_name]) productSales[item.product_name] = 0;
              productSales[item.product_name] += Number(item.quantity) || 0;
            });
          }
        });
        const salesDataByProduct = Object.entries(productSales).map(([name, sales]) => ({ name, sales }));
        // setSalesData(salesDataByProduct); // This line was removed as per the edit hint

        // --- Customer per day chart data ---
        const customerDayMap = {};
        allSales.forEach(sale => {
          const date = sale.created_at ? new Date(sale.created_at).toLocaleDateString() : 'Unknown';
          const name = sale.customer_name || sale.customer?.full_name || '';
          if (!customerDayMap[date]) customerDayMap[date] = { date, uniqueCustomers: new Set(), anonymous: 0 };
          if (name) {
            customerDayMap[date].uniqueCustomers.add(name);
          } else {
            customerDayMap[date].anonymous += 1;
          }
        });
        setCustomerPerDayData(Object.values(customerDayMap).map(d => ({
          date: d.date,
          uniqueCustomers: d.uniqueCustomers.size,
          anonymous: d.anonymous
        })));
        // --- Customer per sale chart data ---
        setCustomerPerSaleData(allSales.map((sale, idx) => {
          const name = sale.customer_name || sale.customer?.full_name || '';
          return {
            sale: idx + 1,
            hasName: !!name,
            label: name || 'Anonymous',
          };
        }));

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 w-full min-h-screen p-0 sm:p-2 md:p-4 lg:p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
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
    <div className="flex flex-col flex-1 w-full min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-50">
      {/* Header & Stats */}
      <div className="bg-white rounded-xl shadow p-3 sm:p-6 mb-4 sm:mb-6 w-full flex-shrink-0">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 md:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center md:text-left w-full md:w-auto">Advanced POS Dashboard</h1>
          <button className="p-2 rounded hover:bg-gray-100 self-end md:self-auto">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
         </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6 w-full">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center bg-gray-100 rounded-lg p-3 sm:p-4 w-full min-w-[120px]">
              <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">{stat.icon}</span>
              <span className="text-lg sm:text-xl font-bold">{stat.value}</span>
              <span className="text-gray-500 text-xs sm:text-sm text-center">{stat.label}</span>
            </div>
          ))}
        </div>
        {/* Quick Actions */}
       </div>

       {/* Main Dashboard Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 flex-1">
        {/* Inventory Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-3 sm:p-6 overflow-x-auto w-full">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Inventory Management</h2>
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
            <table className="min-w-[520px] w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 px-2 sm:px-3">Product Name</th>
                 
                  <th className="py-2 px-2 sm:px-3">Quantity</th>
                  <th className="py-2 px-2 sm:px-3">Price</th>
                  <th className="py-2 px-2 sm:px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.name} className="border-t">
                    <td className="py-2 px-2 sm:px-3 font-medium whitespace-nowrap">{item.name}</td>
                   
                    <td className="py-2 px-2 sm:px-3 whitespace-nowrap">{item.quantity}</td>
                    <td className="py-2 px-2 sm:px-3 whitespace-nowrap">RWF{Math.round(Number(item.price)).toLocaleString()}</td>
                    <td className="py-2 px-2 sm:px-3 whitespace-nowrap">
                      {(() => {
                        const stock = Number(item.quantity);
                        let status = 'In Stock';
                        let color = 'bg-green-100 text-green-700';
                        if (stock <= 0) {
                          status = 'Out-Stock';
                          color = 'bg-pink-100 text-pink-700';
                        } else if (stock <= 20) {
                          status = 'Low Stock';
                          color = 'bg-yellow-100 text-yellow-700';
                        }
                        return (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity replaced with Customer Growth Charts */}
        <div className="bg-white rounded-xl shadow p-3 sm:p-6 flex flex-col w-full mt-4 lg:mt-0">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Customer Growth & Activity</h2>
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-2">Unique Customers Per Day</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={customerPerDayData} margin={{ top: 16, right: 24, left: 8, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-20} height={50} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip formatter={(value, name) => [value, name === 'uniqueCustomers' ? 'Named Customers' : 'Anonymous']} />
                <Bar dataKey="uniqueCustomers" fill="#7c3aed" name="Named Customers" />
                <Bar dataKey="anonymous" fill="#fbbf24" name="Anonymous" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-sm font-bold mb-2">Sales by Customer (Anonymous Highlighted)</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={customerPerSaleData} margin={{ top: 8, right: 24, left: 8, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="sale" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} hide />
                <Tooltip formatter={(_, __, props) => props.payload.label} labelFormatter={sale => `Sale #${sale}`} />
                <Bar dataKey="hasName" fill="#7c3aed" name="Named Customer" isAnimationActive={false} />
                <Bar dataKey={d => d.hasName ? 0 : 1} fill="#fbbf24" name="Anonymous" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;