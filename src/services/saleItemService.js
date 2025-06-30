const API_URL = 'http://localhost:5000/api/sale_items';

export async function getSaleItems() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch sale items');
  return res.json();
}

export async function getSaleItemById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch sale item');
  return res.json();
}

export async function createSaleItem(item) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to create sale item');
  return res.json();
}

export async function updateSaleItem(id, item) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to update sale item');
  return res.json();
}

export async function deleteSaleItem(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete sale item');
  return res.json();
} 