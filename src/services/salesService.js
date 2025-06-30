const API_URL = 'http://localhost:5000/api/sales';

export async function getSales() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch sales');
  return res.json();
}

export async function getSaleById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch sale');
  return res.json();
}

export async function createSale(sale) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale),
  });
  if (!res.ok) throw new Error('Failed to create sale');
  return res.json();
}

export async function updateSale(id, sale) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale),
  });
  if (!res.ok) throw new Error('Failed to update sale');
  return res.json();
}

export async function deleteSale(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete sale');
  return res.json();
} 