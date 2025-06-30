import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

function Dashboard() {
  // Dummy data for stats
  const stats = [
    { label: 'Sales Today', value: '$1,250', icon: '💰' },
    { label: 'Total Customers', value: 320, icon: '🧑‍🤝‍🧑' },
    { label: 'Inventory Value', value: '$8,400', icon: '📦' },
    { label: 'Low Stock', value: 3, icon: '⚠️' },
    { label: 'AI Forecast', value: 'Sneakers', icon: '🤖' },
  ];

  const inventory = [
    { name: 'Shirt', category: 'Clothes', quantity: 5, price: 20, status: 'In Stock' },
    { name: 'Dior', category: 'Perfume', quantity: 0, price: 45, status: 'Out-Stock' },
    { name: 'Dress', category: 'Clothes', quantity: 12, price: 50, status: 'In Stock' },
    { name: 'Sneakers', category: 'Clothes', quantity: 2, price: 60, status: 'Low Stock' },
  ];

  const recentActivity = [
    'Processed sale: 2x Dress',
    'Generated barcode for Dior',
    'AI Forecast: High demand for Sneakers next week',
    'Added new customer: John Doe',
  ];

  // Chart Data
  const salesData = [
    { name: 'Mon', sales: 200 },
    { name: 'Tue', sales: 350 },
    { name: 'Wed', sales: 400 },
    { name: 'Thu', sales: 300 },
    { name: 'Fri', sales: 500 },
    { name: 'Sat', sales: 600 },
    { name: 'Sun', sales: 700 },
  ];

  const demandForecastData = [
    { name: 'Shirt', forecast: 30 },
    { name: 'Dior', forecast: 10 },
    { name: 'Dress', forecast: 50 },
    { name: 'Sneakers', forecast: 70 },
  ];

  const customerInsightsData = [
    { name: 'Returning', value: 220 },
    { name: 'New', value: 100 },
  ];

  const COLORS = ['#7c3aed', '#38bdf8'];

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
        {/* AI Demand Forecast */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col items-center w-full">
          <h3 className="font-semibold mb-2 text-sm sm:text-base">AI Demand Forecast</h3>
          <div className="w-full h-48 sm:h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandForecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="forecast" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Customer Insights Pie Chart */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col items-center w-full">
          <h3 className="font-semibold mb-2 text-sm sm:text-base">Customer Insights</h3>
          <div className="w-full h-32 sm:h-40 md:h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerInsightsData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  label
                >
                  {customerInsightsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Business Intelligence Panel */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-4 sm:mb-6 w-full">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Business Intelligence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
          <div className="bg-purple-50 rounded-lg p-3 sm:p-4 flex flex-col items-center w-full">
            <span className="text-lg sm:text-2xl font-bold text-purple-700 mb-1 sm:mb-2">$3,200</span>
            <span className="text-gray-600 text-xs sm:text-base">Monthly Profit</span>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 flex flex-col items-center w-full">
            <span className="text-lg sm:text-2xl font-bold text-blue-700 mb-1 sm:mb-2">Dress</span>
            <span className="text-gray-600 text-xs sm:text-base">Best Seller</span>
          </div>
          <div className="bg-green-50 rounded-lg p-3 sm:p-4 flex flex-col items-center w-full">
            <span className="text-lg sm:text-2xl font-bold text-green-700 mb-1 sm:mb-2">98%</span>
            <span className="text-gray-600 text-xs sm:text-base">Customer Satisfaction</span>
          </div>
        </div>
      </div>

      {/* Placeholders for future features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6 w-full flex-shrink-0">
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col items-center justify-center min-h-[100px] sm:min-h-[120px] text-gray-400 w-full">
          <span className="text-xs sm:text-lg">[Barcode Generation Panel Placeholder]</span>
        </div>
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col items-center justify-center min-h-[100px] sm:min-h-[120px] text-gray-400 w-full">
          <span className="text-xs sm:text-lg">[AI-powered Recommendations Placeholder]</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
