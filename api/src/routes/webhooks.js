const express = require('express');
const { getStripe } = require('../stripe-client');
const config = require('../config');

const router = express.Router();

// In-memory event log (replace with DB in production)
const eventLog = [];

function getEventLog() {
  return eventLog;
}

function clearEventLog() {
  eventLog.length = 0;
}

// POST /api/webhooks/stripe - handle Stripe webhook events
// IMPORTANT: This route needs raw body, configured in server.js
router.post('/stripe', (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    if (config.stripe.webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
    } else {
      // In dev/test without webhook secret, parse directly
      const raw = Buffer.isBuffer(req.body) ? req.body.toString() : req.body;
      event = typeof raw === 'string' ? JSON.parse(raw) : raw;
    }
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Process the event
  const record = {
    id: event.id,
    type: event.type,
    timestamp: new Date().toISOString(),
    processed: false,
  };

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      record.data = {
        customerId: session.customer,
        subscriptionId: session.subscription,
        email: session.customer_details?.email,
        paymentStatus: session.payment_status,
      };
      record.processed = true;
      console.log(`Checkout completed for ${session.customer_details?.email}`);
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      record.data = {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
      };
      record.processed = true;
      console.log(`Subscription ${event.type}: ${subscription.id} -> ${subscription.status}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      record.data = {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: 'canceled',
      };
      record.processed = true;
      console.log(`Subscription canceled: ${subscription.id}`);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      record.data = {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
      };
      record.processed = true;
      console.log(`Invoice paid: ${invoice.id} - $${invoice.amount_paid / 100}`);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      record.data = {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amountDue: invoice.amount_due,
        attemptCount: invoice.attempt_count,
      };
      record.processed = true;
      console.error(`Invoice payment failed: ${invoice.id}`);
      break;
    }

    default:
      record.processed = false;
      console.log(`Unhandled event type: ${event.type}`);
  }

  eventLog.push(record);

  res.json({ received: true, eventId: event.id });
});

// GET /api/webhooks/events - retrieve processed events (for testing/debugging)
router.get('/events', (_req, res) => {
  res.json({ events: eventLog });
});

module.exports = router;
module.exports.getEventLog = getEventLog;
module.exports.clearEventLog = clearEventLog;
