const API_URL = 'http://localhost:5000/api/stores';

export async function getStores() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch stores');
  return res.json();
}

export async function getStoreById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch store');
  return res.json();
}

export async function createStore(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create store');
  return res.json();
}

export async function updateStore(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update store');
  return res.json();
}

export async function deleteStore(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete store');
  return res.json();
} 