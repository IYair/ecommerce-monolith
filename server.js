const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Serve Strapi uploads
app.use('/uploads', express.static(path.join(__dirname, 'backend/public/uploads')));

// Proxy Strapi admin panel
app.use(
  '/admin',
  createProxyMiddleware({
    target: 'http://localhost:1337',
    changeOrigin: true,
    ws: true,
    logLevel: 'silent',
    onError: (err, req, res) => {
      console.error('Proxy Error (admin):', err.message);
      res.status(502).json({
        error: 'Strapi backend is not running. Please start it with: npm run dev:backend',
      });
    },
  })
);

// Proxy Strapi API
app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:1337',
    changeOrigin: true,
    ws: true,
    logLevel: 'silent',
    onError: (err, req, res) => {
      console.error('Proxy Error (api):', err.message);
      res.status(502).json({
        error: 'Strapi backend is not running. Please start it with: npm run dev:backend',
      });
    },
  })
);

// Proxy Next.js frontend for everything else
app.use(
  '/',
  createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    ws: true,
    logLevel: 'silent',
    onError: (err, req, res) => {
      console.error('Proxy Error (frontend):', err.message);
      res.status(502).json({
        error: 'Next.js frontend is not running. Please start it with: npm run dev:frontend',
      });
    },
  })
);

// Start server
app.listen(PORT, HOST, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🚀 Ecommerce Monolith Server Running                    ║
║                                                           ║
║  📍 Server:    http://${HOST}:${PORT}
║  🏪 Store:     http://localhost:${PORT}
║  ⚙️  Admin:     http://localhost:${PORT}/admin
║  🔌 API:       http://localhost:${PORT}/api
║  💚 Health:    http://localhost:${PORT}/health
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
  console.log('✨ Make sure Strapi (port 1337) and Next.js (port 3001) are running');
  console.log('📝 Run "npm run dev" to start all services\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
