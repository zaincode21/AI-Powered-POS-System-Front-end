const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// PostgreSQL connection config (adjust as needed)
const pool = new Pool({
  user: 'postgres', // change to your db user
  host: 'localhost',
  database: 'your_database', // change to your db name
  password: 'your_password', // change to your db password
  port: 5432,
});

app.use(cors());
app.use(express.json());

// CREATE user
app.post('/api/users', async (req, res) => {
  const { username, email, password_hash, full_name, role, is_active } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [username, email, password_hash, full_name, role, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ single user
app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user
app.put('/api/users/:id', async (req, res) => {
  const { username, email, password_hash, full_name, role, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET username=$1, email=$2, password_hash=$3, full_name=$4, role=$5, is_active=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [username, email, password_hash, full_name, role, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 