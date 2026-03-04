const request = require('supertest');
const createApp = require('../../src/app');
const { setStripe } = require('../../src/stripe-client');
const { mockStripe, reset, mockSubscriptions, mockCustomers } = require('../helpers/stripe-mock');

describe('Stripe E2E Flow', () => {
  let app;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    setStripe(mockStripe);
    app = createApp();
  });

  beforeEach(() => {
    reset();
  });

  describe('Products', () => {
    test('GET /api/products returns all plan tiers', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(3);

      const names = res.body.products.map((p) => p.id);
      expect(names).toContain('starter');
      expect(names).toContain('pro');
      expect(names).toContain('sovereign');

      // Each product should have Stripe IDs
      for (const product of res.body.products) {
        expect(product.stripeProductId).toMatch(/^prod_test_/);
        expect(product.stripePriceId).toMatch(/^price_test_/);
        expect(product.priceMonthly).toBeGreaterThan(0);
      }
    });

    test('GET /api/products is idempotent (no duplicate products)', async () => {
      await request(app).get('/api/products');
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(3);
    });
  });

  describe('Customers', () => {
    test('POST /api/customers creates a customer', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({ email: 'test@blackroad.me', name: 'Test User' });

      expect(res.status).toBe(201);
      expect(res.body.id).toMatch(/^cus_test_/);
      expect(res.body.email).toBe('test@blackroad.me');
      expect(res.body.name).toBe('Test User');
    });

    test('POST /api/customers requires email', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({ name: 'No Email' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('email');
    });

    test('GET /api/customers/:id retrieves a customer', async () => {
      const createRes = await request(app)
        .post('/api/customers')
        .send({ email: 'retrieve@blackroad.me' });

      const res = await request(app).get(`/api/customers/${createRes.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('retrieve@blackroad.me');
    });

    test('GET /api/customers/:id returns 404 for unknown customer', async () => {
      const res = await request(app).get('/api/customers/cus_nonexistent');

      expect(res.status).toBe(404);
    });
  });

  describe('Checkout', () => {
    test('POST /api/checkout creates a checkout session', async () => {
      // First get products to get a real price ID
      const productsRes = await request(app).get('/api/products');
      const priceId = productsRes.body.products[0].stripePriceId;

      const res = await request(app)
        .post('/api/checkout')
        .send({
          priceId,
          customerEmail: 'checkout@blackroad.me',
        });

      expect(res.status).toBe(200);
      expect(res.body.sessionId).toMatch(/^cs_test_/);
      expect(res.body.url).toContain('checkout.stripe.com');
    });

    test('POST /api/checkout requires priceId', async () => {
      const res = await request(app)
        .post('/api/checkout')
        .send({ customerEmail: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('priceId');
    });

    test('GET /api/checkout/:sessionId retrieves session status', async () => {
      const productsRes = await request(app).get('/api/products');
      const priceId = productsRes.body.products[0].stripePriceId;

      const createRes = await request(app)
        .post('/api/checkout')
        .send({ priceId });

      const res = await request(app).get(
        `/api/checkout/${createRes.body.sessionId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('open');
    });
  });

  describe('Webhooks', () => {
    test('POST /api/webhooks/stripe processes checkout.session.completed', async () => {
      const event = {
        id: 'evt_test_checkout_complete',
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_test_1',
            subscription: 'sub_test_1',
            customer_details: { email: 'webhook@blackroad.me' },
            payment_status: 'paid',
          },
        },
      };

      const res = await request(app)
        .post('/api/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(event));

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
      expect(res.body.eventId).toBe('evt_test_checkout_complete');

      // Verify event was logged
      const eventsRes = await request(app).get('/api/webhooks/events');
      expect(eventsRes.body.events).toHaveLength(1);
      expect(eventsRes.body.events[0].type).toBe('checkout.session.completed');
      expect(eventsRes.body.events[0].processed).toBe(true);
    });

    test('POST /api/webhooks/stripe processes subscription events', async () => {
      const event = {
        id: 'evt_test_sub_created',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test_1',
            customer: 'cus_test_1',
            status: 'active',
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
          },
        },
      };

      const res = await request(app)
        .post('/api/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(event));

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
    });

    test('POST /api/webhooks/stripe processes invoice.payment_succeeded', async () => {
      const event = {
        id: 'evt_test_invoice_paid',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_test_1',
            customer: 'cus_test_1',
            amount_paid: 2900,
            currency: 'usd',
          },
        },
      };

      const res = await request(app)
        .post('/api/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(event));

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
    });

    test('POST /api/webhooks/stripe processes invoice.payment_failed', async () => {
      const event = {
        id: 'evt_test_invoice_failed',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_test_2',
            customer: 'cus_test_1',
            amount_due: 2900,
            attempt_count: 1,
          },
        },
      };

      const res = await request(app)
        .post('/api/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(event));

      expect(res.status).toBe(200);
    });

    test('POST /api/webhooks/stripe handles unknown event types', async () => {
      const event = {
        id: 'evt_test_unknown',
        type: 'some.unknown.event',
        data: { object: {} },
      };

      const res = await request(app)
        .post('/api/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(event));

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
    });
  });

  describe('Full E2E: Signup -> Subscribe -> Cancel flow', () => {
    test('complete customer lifecycle', async () => {
      // 1. Create customer
      const customerRes = await request(app)
        .post('/api/customers')
        .send({ email: 'e2e@blackroad.me', name: 'E2E Test' });

      expect(customerRes.status).toBe(201);
      const customerId = customerRes.body.id;

      // 2. Get products
      const productsRes = await request(app).get('/api/products');
      expect(productsRes.status).toBe(200);
      const proPlan = productsRes.body.products.find((p) => p.id === 'pro');

      // 3. Create checkout session
      const checkoutRes = await request(app).post('/api/checkout').send({
        priceId: proPlan.stripePriceId,
        customerEmail: 'e2e@blackroad.me',
      });

      expect(checkoutRes.status).toBe(200);
      expect(checkoutRes.body.url).toBeDefined();

      // 4. Simulate webhook: checkout completed
      const checkoutEvent = {
        id: 'evt_e2e_checkout',
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: customerId,
            subscription: 'sub_e2e_1',
            customer_details: { email: 'e2e@blackroad.me' },
            payment_status: 'paid',
          },
        },
      };

      await request(app)
        .post('/api/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(checkoutEvent));

      // 5. Simulate webhook: subscription created
      // First create a mock subscription so we can query it
      mockSubscriptions.set('sub_e2e_1', {
        id: 'sub_e2e_1',
        object: 'subscription',
        customer: customerId,
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
        cancel_at_period_end: false,
        items: {
          data: [
            {
              price: {
                id: proPlan.stripePriceId,
                product: proPlan.stripeProductId,
                unit_amount: 2900,
                recurring: { interval: 'month' },
              },
            },
          ],
        },
        latest_invoice: null,
        metadata: {},
      });

      const subEvent = {
        id: 'evt_e2e_sub_created',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_e2e_1',
            customer: customerId,
            status: 'active',
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
          },
        },
      };

      await request(app)
        .post('/api/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(subEvent));

      // 6. Verify subscription is active
      const subRes = await request(app).get('/api/subscriptions/sub_e2e_1');
      expect(subRes.status).toBe(200);
      expect(subRes.body.status).toBe('active');

      // 7. Verify customer subscriptions list
      const custSubsRes = await request(app).get(
        `/api/customers/${customerId}/subscriptions`
      );
      expect(custSubsRes.status).toBe(200);
      expect(custSubsRes.body.subscriptions).toHaveLength(1);
      expect(custSubsRes.body.subscriptions[0].status).toBe('active');

      // 8. Cancel subscription (at period end)
      const cancelRes = await request(app)
        .post('/api/subscriptions/sub_e2e_1/cancel')
        .send({ immediately: false });

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.cancelAtPeriodEnd).toBe(true);

      // 9. Reactivate subscription
      const reactivateRes = await request(app)
        .post('/api/subscriptions/sub_e2e_1/reactivate')
        .send();

      expect(reactivateRes.status).toBe(200);
      expect(reactivateRes.body.cancelAtPeriodEnd).toBe(false);

      // 10. Cancel immediately
      const cancelNowRes = await request(app)
        .post('/api/subscriptions/sub_e2e_1/cancel')
        .send({ immediately: true });

      expect(cancelNowRes.status).toBe(200);
      expect(cancelNowRes.body.status).toBe('canceled');

      // 11. Verify all webhook events were logged
      const eventsRes = await request(app).get('/api/webhooks/events');
      expect(eventsRes.body.events.length).toBeGreaterThanOrEqual(2);

      // 12. Create billing portal session
      const portalRes = await request(app)
        .post(`/api/customers/${customerId}/portal`)
        .send({ returnUrl: 'http://aria.blackroad.me' });

      expect(portalRes.status).toBe(200);
      expect(portalRes.body.url).toContain('billing.stripe.com');
    });
  });
});
