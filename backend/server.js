// server.js
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
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB Connection Error:", err.message));
pool.query('SELECT NOW()')
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB Connection Error:", err.message));
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS review_images (
        id SERIAL PRIMARY KEY,
        path VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
