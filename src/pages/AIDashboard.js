import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Package, 
  BarChart3, 
  Brain,
  ShoppingCart,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import {
  getAIDashboardSummary,
  getSalesForecast,
  getInventoryRecommendations,
  getPopularProducts
} from '../services/aiService';

const AIDashboard = () => {
  const [aiSummary, setAiSummary] = useState({});
  const [salesForecast, setSalesForecast] = useState([]);
  const [inventoryRecommendations, setInventoryRecommendations] = useState({});
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    try {
      setLoading(true);
      const [
        summaryData,
        forecastData,
        inventoryData,
        popularData
      ] = await Promise.all([
        getAIDashboardSummary(),
        getSalesForecast(7),
        getInventoryRecommendations(),
        getPopularProducts(5)
      ]);

      setAiSummary(summaryData);
      setSalesForecast(forecastData);
      setInventoryRecommendations(inventoryData);
      setPopularProducts(popularData);
    } catch (err) {
      setError('Failed to load AI insights');
      console.error('Error fetching AI data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore > 0.7) return 'text-red-600';
    if (riskScore > 0.4) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-purple-600 animate-pulse" />
          <p className="text-gray-600">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchAIData}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">AI-Powered Dashboard</h1>
          </div>
          <p className="text-gray-600">Intelligent insights and predictions for your business</p>
        </div>

        {/* AI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Popular Products</p>
                <p className="text-2xl font-bold text-gray-900">{aiSummary.summary?.popularProducts || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Forecast Days</p>
                <p className="text-2xl font-bold text-gray-900">{aiSummary.summary?.forecastDays || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{aiSummary.summary?.inventoryAlerts || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Items</p>
                <p className="text-2xl font-bold text-red-600">{aiSummary.summary?.criticalStockItems || 0}</p>
              </div>
              <Package className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Forecast */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">7-Day Sales Forecast</h2>
            </div>
            <div className="space-y-3">
              {salesForecast.slice(0, 7).map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{day.date}</p>
                    <p className="text-sm text-gray-600">{day.predictedTransactions} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">RWF {day.predictedSales?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{(day.confidence * 100).toFixed(0)}% confidence</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Products */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">AI Recommended Products</h2>
            </div>
            <div className="space-y-3">
              {popularProducts.map((product, index) => (
                <div key={product.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">RWF {product.selling_price?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{product.sale_count || 0} sales</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Inventory Alerts */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">Critical Stock Alerts</h2>
            </div>
            <div className="space-y-3">
              {inventoryRecommendations.recommendations?.lowStock?.slice(0, 5).map((item, index) => (
                <div key={item.product?.id || index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-red-800">{item.product?.name}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(item.urgency)}`}>
                      {item.urgency}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Current: {item.currentStock}</p>
                      <p className="text-gray-600">Reorder: {item.recommendedReorderQuantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Stockout: {item.stockoutDate || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-800">AI Insights</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <p className="font-medium text-blue-800">Sales Trend</p>
                </div>
                <p className="text-sm text-blue-700">
                  Based on historical data, sales are trending upward. Consider increasing inventory for popular items.
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <p className="font-medium text-green-800">Peak Hours</p>
                </div>
                <p className="text-sm text-green-700">
                  Peak sales hours are between 2 PM and 6 PM. Consider scheduling more staff during these times.
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <p className="font-medium text-purple-800">Customer Behavior</p>
                </div>
                <p className="text-sm text-purple-700">
                  Customers who buy electronics often purchase accessories within 7 days. Consider cross-selling strategies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button 
            onClick={fetchAIData}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Refresh AI Insights
          </button>
          
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            View Detailed Reports
          </button>
          
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Manage Inventory
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard; 