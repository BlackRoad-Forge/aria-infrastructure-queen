/**
 * Aria Infrastructure Queen - Cloudflare Worker
 * Handles API requests, health checks, and long-running task orchestration.
 *
 * Endpoints:
 *   GET  /              → Serves the static index.html
 *   GET  /api/health    → Health check with uptime and version
 *   GET  /api/identity  → Returns Aria's identity JSON
 *   GET  /api/status    → Infrastructure status summary
 *   POST /api/tasks     → Queue a long-running task (stub for Durable Objects / Queues)
 *   GET  /api/tasks/:id → Check task status
 */

const IDENTITY = {
  agent_name: "Aria",
  full_name: "Aria - Infrastructure Queen",
  role: "Infrastructure Architecture & Cost Optimization",
  machine: "aria64",
  platform: "Raspberry Pi ARM64",
  identity_hash: "1ba4761e3dcddbe01d2618c02065fdaa807e8c7824999d702a7a13034fd68533",
  symbol: "🎵",
  motto: "Freedom through infrastructure sovereignty",
  version: "2.0.0",
};

const SERVICES = [
  { name: "Meilisearch", port: 7700, replaces: "Algolia", savings: "$588/year" },
  { name: "MinIO", port: 9000, replaces: "AWS S3", savings: "$600/year" },
  { name: "Prometheus", port: 9091, replaces: "Datadog", savings: "$600/year" },
  { name: "Keycloak", port: 5432, replaces: "Auth0", savings: "$300/year" },
  { name: "Headscale UI", port: 8081, replaces: "Tailscale", savings: "$0" },
  { name: "EspoCRM", port: 3306, replaces: "Salesforce", savings: "$900/year" },
];

const DEPLOY_START = Date.now();

// In-memory task store (use Durable Objects or KV for production persistence)
const tasks = new Map();

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "X-Powered-By": "Aria Infrastructure Queen",
    },
  });
}

function handleHealth() {
  return jsonResponse({
    status: "healthy",
    agent: IDENTITY.agent_name,
    version: IDENTITY.version,
    uptime_ms: Date.now() - DEPLOY_START,
    timestamp: new Date().toISOString(),
  });
}

function handleIdentity() {
  return jsonResponse(IDENTITY);
}

function handleStatus() {
  return jsonResponse({
    infrastructure: {
      deployments: [
        { location: "Cloudflare Pages (Global CDN)", status: "operational" },
        { location: "Alice Pi (192.168.4.38:8877)", status: "local-network" },
        { location: "Lucidia Pi (192.168.4.99:8866)", status: "local-network" },
      ],
      services: SERVICES,
      cost: {
        current_monthly: "$81",
        target_monthly: "$23",
        annual_savings: "$3,636",
      },
      repositories: {
        total: 78,
        identity_deployed: 77,
        success_rate: "98%",
      },
    },
    timestamp: new Date().toISOString(),
  });
}

async function handleCreateTask(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const id = crypto.randomUUID();
  const task = {
    id,
    type: body.type || "generic",
    description: body.description || "",
    status: "queued",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  tasks.set(id, task);

  // Simulate async work start
  setTimeout(() => {
    const t = tasks.get(id);
    if (t) {
      t.status = "completed";
      t.updated_at = new Date().toISOString();
    }
  }, 5000);

  return jsonResponse(task, 201);
}

function handleGetTask(id) {
  const task = tasks.get(id);
  if (!task) {
    return jsonResponse({ error: "Task not found" }, 404);
  }
  return jsonResponse(task);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // API routes
    if (path === "/api/health") return handleHealth();
    if (path === "/api/identity") return handleIdentity();
    if (path === "/api/status") return handleStatus();

    if (path === "/api/tasks" && request.method === "POST") {
      return handleCreateTask(request);
    }

    const taskMatch = path.match(/^\/api\/tasks\/([a-f0-9-]+)$/);
    if (taskMatch && request.method === "GET") {
      return handleGetTask(taskMatch[1]);
    }

    // Serve static asset from Pages (fall through)
    if (path === "/" || path === "/index.html") {
      return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Static assets not configured", { status: 503 });
    }

    return jsonResponse({ error: "Not found", available: ["/", "/api/health", "/api/identity", "/api/status", "/api/tasks"] }, 404);
  },
};
