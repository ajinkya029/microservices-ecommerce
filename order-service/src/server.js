require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const Order = mongoose.model('Order', new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  }],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['placed', 'cancelled'], default: 'placed' }
}, { timestamps: true }));

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Bearer token required.' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Invalid or expired token.' }); }
}

app.get('/health', (_req, res) => res.json({ service: 'order-service', status: 'ok' }));
app.post('/', auth, async (req, res, next) => {
  try {
    const rawItems = req.body && req.body.items;
    if (!Array.isArray(rawItems) || rawItems.length < 1 || rawItems.length > 50) {
      return res.status(400).json({ error: 'Provide between 1 and 50 order items.' });
    }
    const merged = new Map();
    for (const item of rawItems) {
      const productId = String(item.productId || '');
      const quantity = Number(item.quantity);
      if (!mongoose.isValidObjectId(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        return res.status(400).json({ error: 'Each item needs a valid productId and integer quantity from 1 to 100.' });
      }
      merged.set(productId, (merged.get(productId) || 0) + quantity);
    }
    const items = [];
    for (const [productId, quantity] of merged) {
      const response = await axios.get(`${process.env.PRODUCT_URL || 'http://localhost:4002'}/${productId}`, { timeout: 4000 });
      const product = response.data;
      if (product.stock < quantity) return res.status(409).json({ error: `Insufficient stock for ${product.name}.` });
      items.push({ productId, name: product.name, unitPrice: product.price, quantity });
    }
    const total = Math.round(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100) / 100;
    const order = await Order.create({ userId: req.user.sub, items, total });
    res.status(201).json(order);
  } catch (err) {
    if (err.response && err.response.status === 404) return res.status(400).json({ error: 'One or more products do not exist.' });
    if (err.code === 'ECONNABORTED' || err.code === 'ECONNREFUSED') return res.status(503).json({ error: 'Product service is unavailable.' });
    next(err);
  }
});
app.get('/', auth, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(100);
    res.json({ items: orders });
  } catch (err) { next(err); }
});
app.get('/:id', auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid order ID.' });
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.sub });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json(order);
  } catch (err) { next(err); }
});
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Internal server error.' }); });

const port = process.env.PORT || 4003;
mongoose.connect(`${process.env.MONGO_URL || 'mongodb://localhost:27017'}/ecommerce_orders`)
  .then(() => app.listen(port, () => console.log(`Order service listening on ${port}`)))
  .catch(err => { console.error('Mongo connection failed', err); process.exit(1); });
