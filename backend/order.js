import express from 'express';
import pool from './database.js';
import nodemailer from 'nodemailer';

const router = express.Router();

const EMAIL_USER = 'ziiproject1@gmail.com';
const EMAIL_PASS = 'eetljfmarrlxmlfc';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

router.post('/order', async (req, res) => {
  const { email, items } = req.body;
  if (!email || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Missing email or order items' });
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255),
        item VARCHAR(255),
        quantity INT,
        price NUMERIC(10,2),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    let total = 0;
    const rowsHtml = [];

    for (const { name, quantity, price } of items) {
      total += price * quantity;
      await pool.query(
        'INSERT INTO orders (email, item, quantity, price) VALUES ($1, $2, $3, $4)',
        [email, name, quantity, price]
      );
      rowsHtml.push(`
        <tr>
          <td>${name}</td>
          <td>${quantity}</td>
          <td>$${price.toFixed(2)}</td>
          <td>$${(price * quantity).toFixed(2)}</td>
        </tr>
      `);
    }

    const html = `
      <div style="font-family: Arial, sans-serif; background-color:rgb(245, 164, 196); padding: 20px; border-radius: 10px; border: 1px solid #ffb6c1;">
        <h2 style="color:rgb(226, 15, 121);">🍰 Thank you for your order from Zii's Delight!</h2>
        <p>Here's what you ordered:</p>
        <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>${rowsHtml.join('')}</tbody>
          <tfoot>
            <tr><td colspan="3" style="text-align:right;"><strong>Total:</strong></td><td><strong>$${total.toFixed(2)}</strong></td></tr>
          </tfoot>
        </table>
        <p>We'll notify you when it's ready! 💖</p>
        <p style="font-size: 0.9em; color: rgb(255, 255, 255);">If you have any Allergies, feel free to reply to this email.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Zii's Delight" <${EMAIL_USER}>`,
      to: email,
      subject: "Zii's Delight | Order Confirmation",
      html
    });

    res.json({ message: 'Order placed and confirmation sent!' });

  } catch (e) {
    res.status(500).json({ message: 'Error processing order', error: e.message });
  }
});

router.get('/orders/:email', async (req, res) => {
  const userEmail = req.params.email;
  try {
    const result = await pool.query(
      'SELECT item, quantity, price, created_at FROM orders WHERE email = $1 ORDER BY created_at DESC',
      [userEmail]
    );
    res.json({ orders: result.rows });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch orders', error: e.message });
  }
});

export default router;
