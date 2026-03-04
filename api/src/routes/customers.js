const express = require('express');
const { getStripe } = require('../stripe-client');

const router = express.Router();

// POST /api/customers - create a Stripe customer
router.post('/', async (req, res, next) => {
  try {
    const { email, name, metadata } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const stripe = getStripe();
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        source: 'aria-infrastructure',
        ...metadata,
      },
    });

    res.status(201).json({
      id: customer.id,
      email: customer.email,
      name: customer.name,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id - get customer details
router.get('/:id', async (req, res, next) => {
  try {
    const stripe = getStripe();
    const customer = await stripe.customers.retrieve(req.params.id);

    if (customer.deleted) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      created: customer.created,
    });
  } catch (err) {
    if (err.type === 'StripeInvalidRequestError') {
      return res.status(404).json({ error: 'Customer not found' });
    }
    next(err);
  }
});

// GET /api/customers/:id/subscriptions - get customer subscriptions
router.get('/:id/subscriptions', async (req, res, next) => {
  try {
    const stripe = getStripe();
    const subscriptions = await stripe.subscriptions.list({
      customer: req.params.id,
      status: 'all',
    });

    res.json({
      subscriptions: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        items: sub.items.data.map(item => ({
          priceId: item.price.id,
          productId: item.price.product,
          amount: item.price.unit_amount,
          interval: item.price.recurring?.interval,
        })),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/customers/:id/portal - create a billing portal session
router.post('/:id/portal', async (req, res, next) => {
  try {
    const stripe = getStripe();
    const { returnUrl } = req.body;

    const session = await stripe.billingPortal.sessions.create({
      customer: req.params.id,
      return_url: returnUrl || 'http://localhost:3000',
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
