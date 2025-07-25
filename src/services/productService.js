const API_URL = 'https://ai-powered-pos-system-back-end.onrender.com/api/products';

// const API_URL = 'http://192.168.1.72:5000/api/products';

export async function getProducts(categoryId) {
  let url = API_URL;
  if (categoryId && categoryId !== 'All') {
    url += `?category=${categoryId}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getInventoryData() {
  const res = await fetch(`${API_URL}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch inventory data');
  return res.json();
}

export async function getProduct(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function createProduct(product) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error(JSON.stringify(await res.json()));
  return res.json();
}

export async function updateProduct(id, product) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error(JSON.stringify(await res.json()));
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(JSON.stringify(await res.json()));
  return res.json();
}

export async function getPriceHistory(productId) {
  const res = await fetch(`${API_URL}/${productId}/price-history`);
  if (!res.ok) throw new Error('Failed to fetch price history');
  return res.json();
} 