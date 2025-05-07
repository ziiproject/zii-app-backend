import express from 'express';
import pool from './database.js';
import nodemailer from 'nodemailer';

const router = express.Router();

const EMAIL_USER = 'ziiproject1@gmail.com';
const EMAIL_PASS = 'eetljfmarrlxmlfc';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Route to place an order
router.post('/order', async (req, res) => {
  const { email, items } = req.body;
  console.log('Incoming order:', { email, items });

  if (!email || !Array.isArray(items) || items.length === 0) {
    console.log('Missing email or items in request');
    return res.status(400).json({ message: 'Missing email or order items' });
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        item VARCHAR(255),
        quantity INT,
        price DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Orders table ensured.');

    let total = 0;
    const rowsHtml = items.map(({ name, quantity, price }) => {
      total += price * quantity;
      console.log(`Inserting item: ${name}, Qty: ${quantity}, Price: ${price}`);
      pool.query('INSERT INTO orders (email,item,quantity,price) VALUES (?,?,?,?)', [email, name, quantity, price]);
      return `
        <tr>
          <td>${name}</td>
          <td>${quantity}</td>
          <td>$${price.toFixed(2)}</td>
          <td>$${(price * quantity).toFixed(2)}</td>
        </tr>`;
    }).join('');

    const html = `
<div style="font-family: Arial, sans-serif; background-color:rgb(245, 164, 196); padding: 20px; border-radius: 10px; border: 1px solid #ffb6c1;">
  <h2 style="color:rgb(226, 15, 121);">🍰 Thank you for your order from Zii's Delight!</h2>
  <p>Here's what you ordered:</p>
  <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th>Item</th><th>Qty</th><th>Price</th><th>Total</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
    <tfoot>
      <tr><td colspan="3" style="text-align:right;"><strong>Total:</strong></td><td><strong>$${total.toFixed(2)}</strong></td></tr>
    </tfoot>
  </table>
  <p>We'll notify you when it's ready! 💖</p>
  <p style="font-size: 0.9em; color: rgb(255, 255, 255);">If you have any Allergies, feel free to reply to this email.</p>
</div>
`;

    console.log(`Sending email to: ${email}`);
    await transporter.sendMail({
      from: `"Zii's Delight" <${EMAIL_USER}>`,
      to: email,
      subject: "Zii's Delight | Order Confirmation",
      html
    });

    console.log('Order processed and email sent.');
    res.json({ message: 'Order placed and confirmation sent!' });

  } catch (e) {
    console.error("Order error:", e);
    res.status(500).json({ message: 'Error processing order', error: e.message });
  }
});

// Route to get orders for a given email
router.get('/orders/:email', async (req, res) => {
  const userEmail = req.params.email;
  console.log(`Fetching orders for: ${userEmail}`);

  try {
    const [rows] = await pool.query(
      'SELECT item,quantity,price,created_at FROM orders WHERE email=? ORDER BY created_at DESC',
      [userEmail]
    );
    console.log(`Found ${rows.length} orders`);
    res.json({ orders: rows });
  } catch (e) {
    console.error('Fetch orders error:', e);
    res.status(500).json({ message: 'Failed to fetch orders', error: e.message });
  }
});

export default router;
