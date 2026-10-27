require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());
app.get('/health', (_req, res) => res.json({ service: 'api-gateway', status: 'ok' }));

const authUrl = process.env.AUTH_URL || 'http://localhost:4001';
const productUrl = process.env.PRODUCT_URL || 'http://localhost:4002';
const orderUrl = process.env.ORDER_URL || 'http://localhost:4003';

app.use('/api/auth', createProxyMiddleware({
  target: authUrl, changeOrigin: true,
  pathRewrite: { '^/api/auth': '' }
}));
app.use('/api/products', createProxyMiddleware({
  target: productUrl, changeOrigin: true,
  pathRewrite: { '^/api/products': '' }
}));
app.use('/api/orders', createProxyMiddleware({
  target: orderUrl, changeOrigin: true,
  pathRewrite: { '^/api/orders': '' }
}));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(502).json({ error: 'A downstream service could not be reached.' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API Gateway listening on ${port}`));
