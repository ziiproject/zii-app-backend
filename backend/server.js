import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

import pool from './database.js';
pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("DB Connection Error:", err.message));

const initTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255),
        item VARCHAR(255),
        quantity INT,
        price DECIMAL(10, 2),
        order_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS review_images (
        id SERIAL PRIMARY KEY,
        path VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        quantity NUMERIC(10, 2),
        unit TEXT,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("All tables are ready");
  } catch (err) {
    console.error("Error initializing tables:", err.message);
  }
};
initTables();

import orderRoutes from './order.js';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});


app.post('/api/signup', async (req, res) => {
  const { firstname, email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    await pool.query(
      'INSERT INTO users (firstname, email, password) VALUES ($1, $2, $3)',
      [firstname, email, password]
    );
    res.status(201).json({ message: 'Account created' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating account', error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});


app.use('/api', orderRoutes);




app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});


app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});



app.post('/api/reviews-image', async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ message: "Image required" });

  try {
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const filename = `review-${uuid()}.png`;
    const folder = path.join(__dirname, 'public/images/reviews');

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const filePath = path.join(folder, filename);
    fs.writeFileSync(filePath, base64Data, 'base64');

    await pool.query("INSERT INTO review_images (path) VALUES ($1)", [`images/reviews/${filename}`]);
    res.status(201).json({ message: "Image saved", path: filename });
  } catch (err) {
    res.status(500).json({ message: "Error saving image", error: err.message });
  }
});

app.get('/api/review-images', async (req, res) => {
  try {
    const result = await pool.query("SELECT path FROM review_images ORDER BY created_at DESC");
    const paths = result.rows.map(row => '/' + row.path);
    res.json(paths);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving images", error: err.message });
  }
});



app.get('/api/ingredients', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ingredients ORDER BY updated_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ingredients", error: err.message });
  }
});


app.post('/api/ingredients', async (req, res) => {
  const { name, quantity, unit } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    await pool.query(
      `INSERT INTO ingredients (name, quantity, unit)
       VALUES ($1, $2, $3)
       ON CONFLICT (name)
       DO UPDATE SET quantity = EXCLUDED.quantity, unit = EXCLUDED.unit, updated_at = CURRENT_TIMESTAMP`,
      [name, quantity, unit]
    );
    res.status(201).json({ message: "Ingredient added or updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add/update ingredient", error: err.message });
  }
});


app.post('/api/ingredients/update', async (req, res) => {
  const { name, change } = req.body;
  if (!name || change === undefined) {
    return res.status(400).json({ message: "Name and change value required" });
  }

  try {
    await pool.query(
      `UPDATE ingredients
       SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP
       WHERE name = $2`,
      [change, name]
    );
    res.status(200).json({ message: "Ingredient quantity updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update ingredient", error: err.message });
  }
});

app.put('/api/ingredients/:id', async (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit } = req.body;

  try {
    await pool.query(
      `UPDATE ingredients SET name = $1, quantity = $2, unit = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4`,
      [name, quantity, unit, id]
    );
    res.json({ message: "Ingredient updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update ingredient", error: err.message });
  }
});

app.delete('/api/ingredients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM ingredients WHERE id = $1", [id]);
    res.json({ message: "Ingredient deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete ingredient", error: err.message });
  }
});

//delete later
app.delete('/api/dev/clean-review-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, image_path FROM review_images');
    const toDelete = [];

    for (const row of result.rows) {
      const localPath = path.join(__dirname, 'public', row.image_path);
      if (!fs.existsSync(localPath)) {
        toDelete.push(row.id);
      }
    }

    for (const id of toDelete) {
      await pool.query('DELETE FROM review_images WHERE id = $1', [id]);
    }

    res.json({ message: `Deleted ${toDelete.length} missing image entries.` });
  } catch (err) {
    console.error("Cleanup failed:", err);
    res.status(500).json({ error: "Cleanup error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
