const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');

const healthRoutes = require('./routes/health');
const productRoutes = require('./routes/products');
const checkoutRoutes = require('./routes/checkout');
const customerRoutes = require('./routes/customers');
const subscriptionRoutes = require('./routes/subscriptions');
const webhookRoutes = require('./routes/webhooks');

function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  app.use(cors({ origin: config.cors.origins }));

  // Logging (skip in test)
  if (config.nodeEnv !== 'test') {
    app.use(morgan('short'));
  }

  // Webhook route needs raw body for signature verification
  app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

  // JSON parsing for all other routes
  app.use(express.json());

  // Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);

  // Error handler
  app.use((err, _req, res, _next) => {
    const status = err.statusCode || err.status || 500;
    const message = config.nodeEnv === 'production' ? 'Internal server error' : err.message;
    console.error(`[ERROR] ${err.message}`);
    res.status(status).json({ error: message });
  });

  return app;
}

module.exports = createApp;
