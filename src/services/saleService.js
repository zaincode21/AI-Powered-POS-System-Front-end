// Function to submit a sale with customer info and items
const API_URL = 'http://192.168.1.71:5000/api/sales';

const res = await fetch(API_URL);
export const submitSale = async ({ customer, sale, items }) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer, sale, items }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to save sale');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Get sales statistics for dashboard
export const getSalesStats = async () => {
  try {
    const response = await fetch(`${API_URL}/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch sales statistics');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Get recent sales for dashboard
export const getRecentSales = async () => {
  try {
    const response = await fetch(`${API_URL}/recent`);
    if (!response.ok) {
      throw new Error('Failed to fetch recent sales');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Get daily sales data for charts
export const getDailySales = async () => {
  try {
    const response = await fetch(`${API_URL}/daily`);
    if (!response.ok) {
      throw new Error('Failed to fetch daily sales');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}; 