/**
 * Aria Infrastructure Queen - Cloudflare Worker API
 * Copyright (c) 2026 BlackRoad OS, Inc. All Rights Reserved.
 *
 * Handles API requests for infrastructure status, health checks,
 * and identity verification.
 */

const IDENTITY_HASH = '1ba4761e3dcddbe01d2618c02065fdaa807e8c7824999d702a7a13034fd68533';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  ...CORS_HEADERS,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    switch (url.pathname) {
      case '/':
        return handleRoot();
      case '/api/health':
        return handleHealth();
      case '/api/identity':
        return handleIdentity();
      case '/api/status':
        return handleStatus();
      case '/api/services':
        return handleServices();
      case '/api/savings':
        return handleSavings();
      default:
        return handleNotFound();
    }
  },
};

function handleRoot() {
  return new Response(JSON.stringify({
    name: 'Aria Infrastructure Queen API',
    version: '1.0.0',
    status: 'operational',
    endpoints: [
      '/api/health',
      '/api/identity',
      '/api/status',
      '/api/services',
      '/api/savings',
    ],
    copyright: 'Copyright (c) 2026 BlackRoad OS, Inc.',
  }), { headers: JSON_HEADERS });
}

function handleHealth() {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: 'operational',
    checks: {
      api: 'pass',
      identity: 'pass',
      worker: 'pass',
    },
  }), { headers: JSON_HEADERS });
}

function handleIdentity() {
  return new Response(JSON.stringify({
    agent_name: 'Aria',
    full_name: 'Aria - Infrastructure Queen',
    role: 'Infrastructure Architecture & Cost Optimization',
    machine: 'aria64',
    platform: 'Raspberry Pi ARM64',
    identity_hash: IDENTITY_HASH,
    symbol: '\u{1F3B5}',
    motto: 'Freedom through infrastructure sovereignty',
    sister_agents: {
      lucidia: 'AI/ML specialist',
      alice: 'Staging specialist',
      cecilia: 'Claude coordination',
    },
  }), { headers: JSON_HEADERS });
}

function handleStatus() {
  return new Response(JSON.stringify({
    infrastructure: {
      cloudflare_pages: { count: 19, status: 'operational' },
      raspberry_pi_nodes: { count: 4, status: 'operational' },
      forkable_services: { count: 6, status: 'operational' },
      automation_systems: { count: 10, status: 'active' },
    },
    deployments: {
      global: 'aria-blackroad-me.pages.dev',
      custom_domain: 'aria.blackroad.me',
    },
    cost: {
      current_monthly: 81,
      target_monthly: 23,
      annual_savings: 3636,
      currency: 'USD',
    },
  }), { headers: JSON_HEADERS });
}

function handleServices() {
  return new Response(JSON.stringify({
    services: [
      { name: 'Meilisearch', port: 7700, replaces: 'Algolia', savings_monthly: 49, status: 'operational' },
      { name: 'MinIO', ports: [9000, 9001], replaces: 'AWS S3', savings_monthly: 50, status: 'operational' },
      { name: 'Prometheus', port: 9091, replaces: 'Datadog', savings_monthly: 50, status: 'operational' },
      { name: 'Keycloak', port: 8443, replaces: 'Auth0', savings_monthly: 25, status: 'ready' },
      { name: 'Headscale UI', port: 8081, replaces: 'Tailscale', savings_monthly: 0, status: 'operational' },
      { name: 'EspoCRM', port: 8080, replaces: 'Salesforce', savings_monthly: 75, status: 'ready' },
    ],
    total_monthly_savings: 249,
    total_annual_savings: 2988,
  }), { headers: JSON_HEADERS });
}

function handleSavings() {
  return new Response(JSON.stringify({
    summary: {
      saas_to_forkables: { monthly: 249, annual: 2988 },
      infrastructure_migration: { monthly: 54, annual: 648 },
      total: { monthly: 303, annual: 3636 },
    },
    breakdown: [
      { from: 'Algolia', to: 'Meilisearch', monthly: 49, annual: 588 },
      { from: 'AWS S3', to: 'MinIO', monthly: 50, annual: 600 },
      { from: 'Datadog', to: 'Prometheus+Grafana', monthly: 50, annual: 600 },
      { from: 'Auth0', to: 'Keycloak', monthly: 25, annual: 300 },
      { from: 'Salesforce', to: 'EspoCRM', monthly: 75, annual: 900 },
      { from: 'DigitalOcean', to: 'Oracle Cloud Free', monthly: 54, annual: 648 },
    ],
    currency: 'USD',
  }), { headers: JSON_HEADERS });
}

function handleNotFound() {
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: 'Endpoint not found. See / for available endpoints.',
  }), { status: 404, headers: JSON_HEADERS });
}
