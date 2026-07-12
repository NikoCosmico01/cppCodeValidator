// server.js
const express = require('express');
const cors = require('cors');

const config = require('./config/config');
const checkRoutes = require('./routes/check');

const app = express();
app.disable('x-powered-by');

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: config.MAX_CODE_SIZE + 65536 }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', checkRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'C++ Code Validator API',
    version: '1.0.0',
    endpoints: {
      check: 'POST /api/check',
      health: 'GET /api/health',
      version: 'GET /api/version'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body exceeds the maximum size'
    });
  }
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(config.PORT, () => {
  console.log(`✓ C++ Code Validator API running on port ${config.PORT}`);
  console.log(`✓ Environment: ${config.NODE_ENV}`);
  console.log(`✓ CORS enabled for: ${config.CORS_ORIGIN}`);
});
