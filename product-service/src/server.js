require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const Product = mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, default: '', maxlength: 3000 },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  category: { type: String, default: 'General', trim: true },
  active: { type: Boolean, default: true }
}, { timestamps: true }));

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Bearer token required.' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Invalid or expired token.' }); }
}
function admin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin role required.' });
  next();
}

app.get('/health', (_req, res) => res.json({ service: 'product-service', status: 'ok' }));
app.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const filter = { active: true };
    if (req.query.category) filter.category = String(req.query.category);
    if (req.query.q) filter.name = { $regex: String(req.query.q).slice(0, 80), $options: 'i' };
    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter)
    ]);
    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});
app.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid product ID.' });
    const product = await Product.findOne({ _id: req.params.id, active: true });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(product);
  } catch (err) { next(err); }
});
app.post('/', auth, admin, async (req, res, next) => {
  try {
    const { name, description, price, stock, category } = req.body || {};
    if (!name || !Number.isFinite(Number(price)) || Number(price) < 0 ||
        !Number.isInteger(Number(stock ?? 0)) || Number(stock ?? 0) < 0) {
      return res.status(400).json({ error: 'Name, non-negative price, and non-negative integer stock are required.' });
    }
    const product = await Product.create({ name, description, price: Number(price), stock: Number(stock ?? 0), category });
    res.status(201).json(product);
  } catch (err) { next(err); }
});
app.patch('/:id', auth, admin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid product ID.' });
    const allowed = ['name', 'description', 'price', 'stock', 'category', 'active'];
    const update = {};
    for (const key of allowed) if (req.body && req.body[key] !== undefined) update[key] = req.body[key];
    if ('price' in update && (!Number.isFinite(Number(update.price)) || Number(update.price) < 0))
      return res.status(400).json({ error: 'Price must be non-negative.' });
    if ('stock' in update && (!Number.isInteger(Number(update.stock)) || Number(update.stock) < 0))
      return res.status(400).json({ error: 'Stock must be a non-negative integer.' });
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(product);
  } catch (err) { next(err); }
});
app.delete('/:id', auth, admin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid product ID.' });
    const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json({ message: 'Product deactivated.', id: product.id });
  } catch (err) { next(err); }
});
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Internal server error.' }); });

const port = process.env.PORT || 4002;
mongoose.connect(`${process.env.MONGO_URL || 'mongodb://localhost:27017'}/ecommerce_products`)
  .then(() => app.listen(port, () => console.log(`Product service listening on ${port}`)))
  .catch(err => { console.error('Mongo connection failed', err); process.exit(1); });
