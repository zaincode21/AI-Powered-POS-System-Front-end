import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { getSalesStats, getDailySales, getRecentSales } from '../services/saleService';
import { getInventoryData } from '../services/productService';
import { getCustomers } from '../services/customerService';

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#7c3aed', '#38bdf8'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [statsData, inventoryData, customers, dailySales, recentSales] = await Promise.all([
          getSalesStats(),
          getInventoryData(),
          getCustomers(),
          getDailySales(),
          getRecentSales(),
        ]);

        // Transform statsData object into an array for rendering
        setStats([
          { label: "Today's Sales", value: `$${statsData.todaySales}`, icon: "💰" },
          { label: "Total Customers", value: statsData.totalCustomers, icon: "🧑‍🤝‍🧑" },
          { label: "Inventory Value", value: `$${statsData.inventoryValue}`, icon: "📦" },
          { label: "Low Stock Items", value: statsData.lowStockCount, icon: "⚠️" },
          { label: "Best Seller", value: statsData.bestSeller, icon: "🏆" }
        ]);
        setInventory(inventoryData);
        setRecentActivity(recentSales.map(sale => `Sale #${sale.sale_number} - $${sale.total_amount}`));
        setSalesData(dailySales);

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
    <div className="flex flex-col flex-1 w-full min-h-screen p-0 sm:p-2 md:p-4 lg:p-6">
      {/* Header & Stats */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-4 sm:mb-6 w-full flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Advanced POS Dashboard</h1>
          <button className="p-2 rounded hover:bg-gray-100">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center bg-gray-100 rounded-lg p-3 sm:p-4 w-full">
              <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">{stat.icon}</span>
              <span className="text-lg sm:text-xl font-bold">{stat.value}</span>
              <span className="text-gray-500 text-xs sm:text-sm text-center">{stat.label}</span>
            </div>
          ))}
        </div>
        {/* Quick Actions */}
      
      </div>

      {/* Main Dashboard Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 flex-1">
        {/* Inventory Table */}
        <div className="md:col-span-2 bg-white rounded-xl shadow p-4 sm:p-6 overflow-x-auto w-full">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Inventory Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 px-2 sm:px-3">Product Name</th>
                  <th className="py-2 px-2 sm:px-3">Category</th>
                  <th className="py-2 px-2 sm:px-3">Quantity</th>
                  <th className="py-2 px-2 sm:px-3">Price</th>
                  <th className="py-2 px-2 sm:px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.name} className="border-t">
                    <td className="py-2 px-2 sm:px-3 font-medium whitespace-nowrap">{item.name}</td>
                    <td className="py-2 px-2 sm:px-3 whitespace-nowrap">{item.category}</td>
                    <td className="py-2 px-2 sm:px-3 whitespace-nowrap">{item.quantity}</td>
                    <td className="py-2 px-2 sm:px-3 whitespace-nowrap">${item.price}</td>
                    <td className="py-2 px-2 sm:px-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'In Stock' ? 'bg-green-100 text-green-700' : item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' : 'bg-pink-100 text-pink-700'}`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col w-full">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Activity</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1 sm:space-y-2 text-xs sm:text-sm">
            {recentActivity.map((activity, idx) => (
              <li key={idx}>{activity}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Advanced Analytics & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6 w-full">
        {/* Sales Overview Bar Chart */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col items-center md:col-span-2 w-full">
          <h3 className="font-semibold mb-2 text-sm sm:text-base">Real-Time Sales Overview</h3>
          <div className="w-full h-48 sm:h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Business Intelligence Panel */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-4 sm:mb-6 w-full">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Business Intelligence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
          <div className="bg-purple-50 rounded-lg p-3 sm:p-4 flex flex-col items-center w-full">
            <span className="text-lg sm:text-2xl font-bold text-purple-700 mb-1 sm:mb-2">${stats[0]?.value?.replace('$', '') || '0'}</span>
            <span className="text-gray-600 text-xs sm:text-base">Today's Sales</span>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 flex flex-col items-center w-full">
            <span className="text-lg sm:text-2xl font-bold text-blue-700 mb-1 sm:mb-2">{stats[4]?.value || 'N/A'}</span>
            <span className="text-gray-600 text-xs sm:text-base">Best Seller</span>
          </div>
          <div className="bg-green-50 rounded-lg p-3 sm:p-4 flex flex-col items-center w-full">
            <span className="text-lg sm:text-2xl font-bold text-green-700 mb-1 sm:mb-2">{stats[1]?.value || 0}</span>
            <span className="text-gray-600 text-xs sm:text-base">Total Customers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
