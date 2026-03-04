const request = require('supertest');
const createApp = require('../../src/app');

describe('Health API', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  test('GET /api/health returns operational status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('operational');
    expect(res.body.agent).toBe('aria');
    expect(res.body.service).toBe('stripe-billing-api');
    expect(res.body.timestamp).toBeDefined();
  });
});
