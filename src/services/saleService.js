// Function to submit a sale with customer info and items
const API_URL = 'https://ai-powered-pos-system-back-end.onrender.com/api/sales';

// const API_URL = 'http://10.42.0.85:5000/api/sales';

export const submitSale = async ({ customer, sale, items }) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer, sale, items }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || err.details || 'Failed to save sale');
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

// Fetch all sales
export const getSales = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Failed to fetch sales');
  return response.json();
};

// Fetch sale items for a given sale ID
export const getSaleItems = async (saleId) => {
  const response = await fetch(`${API_URL}/${saleId}/items`);
  if (!response.ok) throw new Error('Failed to fetch sale items');
  return response.json();
};

// Fetch sale details with items
export const getSaleDetails = async (saleId) => {
  const response = await fetch(`${API_URL}/${saleId}`);
  if (!response.ok) throw new Error('Failed to fetch sale details');
  return response.json();
};

// Delete a sale by ID
export const deleteSale = async (saleId) => {
  const response = await fetch(`${API_URL}/${saleId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete sale');
  return response.json();
}; 