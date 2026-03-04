const Stripe = require('stripe');
const config = require('./config');

let stripe = null;

function getStripe() {
  if (!stripe) {
    if (!config.stripe.secretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not set. Copy .env.example to .env and add your Stripe test key.'
      );
    }
    stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return stripe;
}

// Allow injection for testing
function setStripe(instance) {
  stripe = instance;
}

module.exports = { getStripe, setStripe };
