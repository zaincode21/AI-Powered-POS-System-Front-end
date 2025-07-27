const  API_BASE_URL = 'https://ai-powered-pos-system-back-end.onrender.com/api/ai';


// const API_BASE_URL = 'http://192.168.1.71:5000/api/ai';

// Product Recommendations
export const getCustomerRecommendations = async (customerId, limit = 5) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommendations/customer/${customerId}?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch customer recommendations');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching customer recommendations:', error);
    return [];
  }
};

export const getPopularProducts = async (limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommendations/popular?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch popular products');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching popular products:', error);
    return [];
  }
};

export const getComplementaryProducts = async (productId, limit = 5) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommendations/complementary/${productId}?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch complementary products');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching complementary products:', error);
    return [];
  }
};

// Sales Forecasting
export const getSalesForecast = async (days = 30) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forecast/sales?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch sales forecast');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching sales forecast:', error);
    return [];
  }
};

export const getProductForecast = async (productId, days = 30) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forecast/product/${productId}?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch product forecast');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching product forecast:', error);
    return [];
  }
};

// Fraud Detection
export const detectFraud = async (transaction) => {
  try {
    const response = await fetch(`${API_BASE_URL}/fraud/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    if (!response.ok) throw new Error('Failed to perform fraud detection');
    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error('Error in fraud detection:', error);
    return { isFraudulent: false, riskScore: 0, indicators: [] };
  }
};

// Inventory Management
export const getInventoryRecommendations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/recommendations`);
    if (!response.ok) throw new Error('Failed to fetch inventory recommendations');
    const data = await response.json();
    return data.data || { recommendations: {}, summary: {} };
  } catch (error) {
    console.error('Error fetching inventory recommendations:', error);
    return { recommendations: {}, summary: {} };
  }
};

export const getLowStockAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/low-stock-alerts`);
    if (!response.ok) throw new Error('Failed to fetch low stock alerts');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    return [];
  }
};

// AI Dashboard Summary
export const getAIDashboardSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`);
    if (!response.ok) throw new Error('Failed to fetch AI dashboard summary');
    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error('Error fetching AI dashboard summary:', error);
    return {};
  }
}; 