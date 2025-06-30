const API_URL = 'http://localhost:5000/api/suppliers';

export async function getSuppliers() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch suppliers');
  return res.json();
}

export async function getSupplier(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch supplier');
  return res.json();
}

export async function createSupplier(supplier) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplier),
  });
  if (!res.ok) throw new Error(JSON.stringify(await res.json()));
  return res.json();
}

export async function updateSupplier(id, supplier) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplier),
  });
  if (!res.ok) throw new Error(JSON.stringify(await res.json()));
  return res.json();
}

export async function deleteSupplier(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(JSON.stringify(await res.json()));
  return res.json();
} 