// Mock Stripe client for testing without real API keys
// Simulates Stripe API responses for all routes

const mockCustomers = new Map();
const mockSubscriptions = new Map();
const mockProducts = new Map();
const mockPrices = new Map();
const mockSessions = new Map();

let idCounter = 1;
function mockId(prefix) {
  return `${prefix}_test_${idCounter++}`;
}

function reset() {
  mockCustomers.clear();
  mockSubscriptions.clear();
  mockProducts.clear();
  mockPrices.clear();
  mockSessions.clear();
  idCounter = 1;
}

const mockStripe = {
  customers: {
    create: async (params) => {
      const id = mockId('cus');
      const customer = {
        id,
        object: 'customer',
        email: params.email,
        name: params.name || null,
        metadata: params.metadata || {},
        created: Math.floor(Date.now() / 1000),
        deleted: false,
      };
      mockCustomers.set(id, customer);
      return customer;
    },
    retrieve: async (id) => {
      const customer = mockCustomers.get(id);
      if (!customer) {
        const err = new Error(`No such customer: '${id}'`);
        err.type = 'StripeInvalidRequestError';
        throw err;
      }
      return customer;
    },
  },

  products: {
    create: async (params) => {
      const id = mockId('prod');
      const product = {
        id,
        object: 'product',
        name: params.name,
        description: params.description || null,
        metadata: params.metadata || {},
        active: true,
      };
      mockProducts.set(id, product);
      return product;
    },
    search: async ({ query }) => {
      const match = query.match(/metadata\["plan_id"\]:"(\w+)"/);
      const planId = match ? match[1] : null;
      const results = [...mockProducts.values()].filter(
        (p) => p.metadata.plan_id === planId
      );
      return { data: results };
    },
  },

  prices: {
    create: async (params) => {
      const id = mockId('price');
      const price = {
        id,
        object: 'price',
        product: params.product,
        unit_amount: params.unit_amount,
        currency: params.currency,
        recurring: params.recurring || null,
        metadata: params.metadata || {},
        active: true,
        type: params.recurring ? 'recurring' : 'one_time',
      };
      mockPrices.set(id, price);
      return price;
    },
    list: async ({ product, active, type }) => {
      const results = [...mockPrices.values()].filter((p) => {
        if (product && p.product !== product) return false;
        if (active !== undefined && p.active !== active) return false;
        if (type === 'recurring' && !p.recurring) return false;
        return true;
      });
      return { data: results };
    },
  },

  checkout: {
    sessions: {
      create: async (params) => {
        const id = mockId('cs');
        const session = {
          id,
          object: 'checkout.session',
          url: `https://checkout.stripe.com/test/${id}`,
          status: 'open',
          payment_status: 'unpaid',
          mode: params.mode,
          customer_email: params.customer_email || null,
          customer_details: params.customer_email
            ? { email: params.customer_email }
            : null,
          subscription: null,
          metadata: params.metadata || {},
          line_items: params.line_items,
        };
        mockSessions.set(id, session);
        return session;
      },
      retrieve: async (id, opts) => {
        const session = mockSessions.get(id);
        if (!session) {
          const err = new Error(`No such checkout session: '${id}'`);
          err.type = 'StripeInvalidRequestError';
          throw err;
        }
        return session;
      },
    },
  },

  subscriptions: {
    create: async (params) => {
      const id = mockId('sub');
      const sub = {
        id,
        object: 'subscription',
        customer: params.customer,
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
        cancel_at_period_end: false,
        items: {
          data: (params.items || []).map((item) => ({
            price: mockPrices.get(item.price) || { id: item.price, product: 'prod_test', unit_amount: 900, recurring: { interval: 'month' } },
          })),
        },
        latest_invoice: null,
        metadata: params.metadata || {},
      };
      mockSubscriptions.set(id, sub);
      return sub;
    },
    retrieve: async (id, opts) => {
      const sub = mockSubscriptions.get(id);
      if (!sub) {
        const err = new Error(`No such subscription: '${id}'`);
        err.type = 'StripeInvalidRequestError';
        throw err;
      }
      return sub;
    },
    update: async (id, params) => {
      const sub = mockSubscriptions.get(id);
      if (!sub) {
        const err = new Error(`No such subscription: '${id}'`);
        err.type = 'StripeInvalidRequestError';
        throw err;
      }
      Object.assign(sub, params);
      return sub;
    },
    cancel: async (id) => {
      const sub = mockSubscriptions.get(id);
      if (!sub) {
        const err = new Error(`No such subscription: '${id}'`);
        err.type = 'StripeInvalidRequestError';
        throw err;
      }
      sub.status = 'canceled';
      return sub;
    },
    list: async ({ customer, status }) => {
      const results = [...mockSubscriptions.values()].filter((s) => {
        if (customer && s.customer !== customer) return false;
        return true;
      });
      return { data: results };
    },
  },

  billingPortal: {
    sessions: {
      create: async (params) => {
        return {
          id: mockId('bps'),
          url: `https://billing.stripe.com/test/session/${params.customer}`,
          return_url: params.return_url,
        };
      },
    },
  },

  webhooks: {
    constructEvent: (body, sig, secret) => {
      // In test mode, just parse the body
      return typeof body === 'string' ? JSON.parse(body) : JSON.parse(body.toString());
    },
  },
};

module.exports = { mockStripe, reset, mockSubscriptions, mockCustomers };
