// const API_URL = 'https://ai-powered-pos-system-back-end.onrender.com/api/users';

// const AUTH_URL = 'https://ai-powered-pos-system-back-end.onrender.com/api/auth';

const API_URL = 'http://192.168.1.71:5000/api/users';
const AUTH_URL = 'http://192.168.1.71:5000/api/auth';


export async function getUsers() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function getUser(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function createUser(user) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}

export async function updateUser(id, user) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
}

export async function loginUser({ email, password, role }) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });
  if (!res.ok) {
    let errorMsg = 'Login failed';
    try {
      const err = await res.json();
      if (err && err.error) errorMsg = err.error;
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
} 