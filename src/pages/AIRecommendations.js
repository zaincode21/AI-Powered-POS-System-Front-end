import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Package, 
  Search,
  ShoppingCart,
  Star,
  ArrowRight
} from 'lucide-react';
import {
  getCustomerRecommendations,
  getPopularProducts,
  getComplementaryProducts
} from '../services/aiService';
import { getCustomers } from '../services/customerService';

const AIRecommendations = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [customerRecommendations, setCustomerRecommendations] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [complementaryProducts, setComplementaryProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchPopularProducts();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerRecommendations(selectedCustomer);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (selectedProduct) {
      fetchComplementaryProducts(selectedProduct);
    }
  }, [selectedProduct]);

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchPopularProducts = async () => {
    try {
      setLoading(true);
      const data = await getPopularProducts(10);
      setPopularProducts(data);
    } catch (error) {
      console.error('Error fetching popular products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerRecommendations = async (customerId) => {
    try {
      setLoading(true);
      const data = await getCustomerRecommendations(customerId, 8);
      setCustomerRecommendations(data);
    } catch (error) {
      console.error('Error fetching customer recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplementaryProducts = async (productId) => {
    try {
      setLoading(true);
      const data = await getComplementaryProducts(productId, 6);
      setComplementaryProducts(data);
    } catch (error) {
      console.error('Error fetching complementary products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (stock <= 5) return { text: 'Low Stock', color: 'text-orange-600 bg-orange-100' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">AI Product Recommendations</h1>
          </div>
          <p className="text-gray-600">Intelligent product suggestions based on customer behavior and sales patterns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer-Specific Recommendations */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Customer-Specific Recommendations</h2>
              </div>

              {/* Customer Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer for Personalized Recommendations
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Choose a customer...</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Analyzing customer preferences...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customerRecommendations.map((product, index) => {
                        const stockStatus = getStockStatus(product.current_stock);
                        return (
                          <div key={product.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                {stockStatus.text}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{product.category_name}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-purple-600">
                                RWF {product.selling_price?.toLocaleString()}
                              </span>
                              <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-1">
                                <ShoppingCart className="h-3 w-3" />
                                Add
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Popular Products */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">Popular Products</h2>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {popularProducts.map((product, index) => {
                  const stockStatus = getStockStatus(product.current_stock);
                  return (
                    <div key={product.id || index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-800 text-sm truncate">{product.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{product.category_name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-green-600">
                          RWF {product.selling_price?.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {product.sale_count || 0} sales
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Complementary Products */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-800">Frequently Bought Together</h2>
            </div>

            {/* Product Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a product to see complementary items
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Choose a product...</option>
                {popularProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Finding complementary products...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {complementaryProducts.map((product, index) => {
                      const stockStatus = getStockStatus(product.current_stock);
                      return (
                        <div key={product.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                              {stockStatus.text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{product.category_name}</p>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-orange-600">
                              RWF {product.selling_price?.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <TrendingUp className="h-3 w-3" />
                              {product.co_occurrence_count || 0} times
                            </div>
                          </div>
                          <button className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 flex items-center justify-center gap-2">
                            <ShoppingCart className="h-3 w-3" />
                            Add to Cart
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">AI Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h3 className="font-medium text-purple-800 mb-2">Customer Behavior</h3>
              <p className="text-gray-700">Our AI analyzes purchase patterns to suggest products that customers are likely to buy together.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h3 className="font-medium text-purple-800 mb-2">Trend Analysis</h3>
              <p className="text-gray-700">Popular products are identified based on sales frequency and customer preferences over time.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h3 className="font-medium text-purple-800 mb-2">Personalization</h3>
              <p className="text-gray-700">Customer-specific recommendations are generated based on their individual purchase history and preferences.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations; 