const API_URL = 'http://localhost:5000/api/categories';

export async function getCategories() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function getCategory(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch category');
  return res.json();
}

export async function createCategory(category) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  });
  if (!res.ok) throw new Error(JSON.stringify(await res.json()));
  return res.json();
}

export async function updateCategory(id, category) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  });
  if (!res.ok) throw new Error(JSON.stringify(await res.json()));
  return res.json();
}

export async function deleteCategory(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(JSON.stringify(await res.json()));
  return res.json();
} 