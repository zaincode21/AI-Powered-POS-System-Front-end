// const API_URL = 'https://ai-powered-pos-system-back-end.onrender.com/api/customers';

const API_URL ='http://192.168.1.77:5000/api/customers';

export async function getCustomers() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function getCustomerById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch customer');
  return res.json();
}

export async function createCustomer(customer) {
  // Ensure all fields are present, set missing ones to null
  const payload = {
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    phone: customer.phone,
    gender: customer.gender,
    city: customer.city,
    total_purchases: customer.total_purchases,
    total_spent: customer.total_spent,
    is_active: customer.is_active,
    date_of_birth: customer.date_of_birth || null,
    address_line1: customer.address_line1 || null,
    address_line2: customer.address_line2 || null,
    state: customer.state || null,
    postal_code: customer.postal_code || null,
    country: customer.country || null,
    average_order_value: customer.average_order_value || null,
    preferred_category_id: customer.preferred_category_id || null,
    customer_lifetime_value: customer.customer_lifetime_value || null,
    loyalty_points: customer.loyalty_points || null,
    marketing_opt_in: customer.marketing_opt_in || null,
    preferred_contact_method: customer.preferred_contact_method || null,
    last_visit: customer.last_visit || null
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
}

export async function updateCustomer(id, customer) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  if (!res.ok) throw new Error('Failed to update customer');
  return res.json();
}

export async function deleteCustomer(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete customer');
  return res.json();
} 