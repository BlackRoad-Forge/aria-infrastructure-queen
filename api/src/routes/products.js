const express = require('express');
const { getStripe } = require('../stripe-client');
const config = require('../config');

const router = express.Router();

// Ensure Stripe products and prices exist, return them
async function ensureProducts() {
  const stripe = getStripe();
  const products = [];

  for (const [key, plan] of Object.entries(config.plans)) {
    // Search for existing product by metadata
    const existing = await stripe.products.search({
      query: `metadata["plan_id"]:"${key}"`,
    });

    let product;
    if (existing.data.length > 0) {
      product = existing.data[0];
    } else {
      product = await stripe.products.create({
        name: `Aria ${plan.name}`,
        description: plan.description,
        metadata: { plan_id: key },
      });
    }

    // Find or create recurring price
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      type: 'recurring',
    });

    let price;
    if (prices.data.length > 0) {
      price = prices.data[0];
    } else {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.priceMonthly,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { plan_id: key },
      });
    }

    products.push({
      id: key,
      name: plan.name,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      stripeProductId: product.id,
      stripePriceId: price.id,
    });
  }

  return products;
}

// GET /api/products - list all plans with Stripe price IDs
router.get('/', async (_req, res, next) => {
  try {
    const products = await ensureProducts();
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.ensureProducts = ensureProducts;
