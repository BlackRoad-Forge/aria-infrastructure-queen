const express = require('express');
const { getStripe } = require('../stripe-client');

const router = express.Router();

// POST /api/checkout - create a Stripe Checkout session
router.post('/', async (req, res, next) => {
  try {
    const { priceId, customerEmail, successUrl, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }

    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${req.headers.origin || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin || 'http://localhost:3000'}/cancel`,
      metadata: {
        source: 'aria-infrastructure',
      },
    };

    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/checkout/:sessionId - retrieve session status
router.get('/:sessionId', async (req, res, next) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
      expand: ['subscription', 'customer'],
    });

    res.json({
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email,
      subscription: session.subscription
        ? {
            id: session.subscription.id,
            status: session.subscription.status,
            currentPeriodEnd: session.subscription.current_period_end,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
