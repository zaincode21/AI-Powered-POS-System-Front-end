const API_URL = 'http://localhost:5000/api/customers';

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
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
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