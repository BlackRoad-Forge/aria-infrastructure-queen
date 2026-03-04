const path = require('path');

// Load .env from api directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
      .split(',')
      .map(s => s.trim()),
  },

  // Infrastructure plan tiers
  plans: {
    starter: {
      name: 'Starter',
      description: 'Single Pi node, basic monitoring',
      priceMonthly: 900, // $9.00 in cents
    },
    pro: {
      name: 'Pro',
      description: 'Multi-node cluster, full monitoring + alerts',
      priceMonthly: 2900, // $29.00
    },
    sovereign: {
      name: 'Sovereign',
      description: 'Full infrastructure sovereignty, all services, priority support',
      priceMonthly: 7900, // $79.00
    },
  },
};

module.exports = config;
