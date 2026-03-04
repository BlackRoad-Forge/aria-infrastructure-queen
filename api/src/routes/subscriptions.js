const express = require('express');
const { getStripe } = require('../stripe-client');

const router = express.Router();

// GET /api/subscriptions/:id - get subscription details
router.get('/:id', async (req, res, next) => {
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(req.params.id, {
      expand: ['latest_invoice', 'customer'],
    });

    res.json({
      id: subscription.id,
      status: subscription.status,
      customerId: subscription.customer.id || subscription.customer,
      customerEmail: subscription.customer.email || null,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      items: subscription.items.data.map(item => ({
        priceId: item.price.id,
        productId: item.price.product,
        amount: item.price.unit_amount,
        interval: item.price.recurring?.interval,
      })),
      latestInvoice: subscription.latest_invoice
        ? {
            id: subscription.latest_invoice.id || subscription.latest_invoice,
            status: subscription.latest_invoice.status,
            amountPaid: subscription.latest_invoice.amount_paid,
          }
        : null,
    });
  } catch (err) {
    if (err.type === 'StripeInvalidRequestError') {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    next(err);
  }
});

// POST /api/subscriptions/:id/cancel - cancel a subscription
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const stripe = getStripe();
    const { immediately } = req.body;

    let subscription;
    if (immediately) {
      subscription = await stripe.subscriptions.cancel(req.params.id);
    } else {
      subscription = await stripe.subscriptions.update(req.params.id, {
        cancel_at_period_end: true,
      });
    }

    res.json({
      id: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscriptions/:id/reactivate - reactivate a canceled subscription
router.post('/:id/reactivate', async (req, res, next) => {
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.update(req.params.id, {
      cancel_at_period_end: false,
    });

    res.json({
      id: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
