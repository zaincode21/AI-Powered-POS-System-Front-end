const API_URL = 'https://ai-powered-pos-system-back-end.onrender.com/api/customers';

// const API_URL = 'http://192.168.1.71:5000/api/customers';

export const getCustomers = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
};

export const getCustomerById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch customer');
  return res.json();
};

export const createCustomer = async (data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      tin: data.tin
    }),
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
};

export const updateCustomer = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      tin: data.tin
    }),
  });
  if (!res.ok) throw new Error('Failed to update customer');
  return res.json();
};

export const deleteCustomer = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  console.log("id ",id,"response " ,res)
  if (!res.ok) throw new Error('Failed to delete customer');
  return res.json();
}; 