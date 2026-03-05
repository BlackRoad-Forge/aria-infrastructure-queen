# 🎵 Aria - Infrastructure Queen

**Infrastructure Architecture & Cost Optimization**

> *"Freedom through infrastructure sovereignty"*

[![CORE CI](https://github.com/blackboxprogramming/aria-infrastructure-queen/actions/workflows/core-ci.yml/badge.svg)](https://github.com/blackboxprogramming/aria-infrastructure-queen/actions/workflows/core-ci.yml)
[![Deploy](https://github.com/blackboxprogramming/aria-infrastructure-queen/actions/workflows/deploy.yml/badge.svg)](https://github.com/blackboxprogramming/aria-infrastructure-queen/actions/workflows/deploy.yml)

---

## Verified & Working

| Component | Status | Details |
|-----------|--------|---------|
| **CI Pipeline** | ✅ Running | HTML, JSON, shell script validation + security scan |
| **Cloudflare Pages** | ✅ Deployed | `aria-blackroad-me.pages.dev` |
| **Cloudflare Worker** | ✅ Ready | API endpoints: `/api/health`, `/api/identity`, `/api/status`, `/api/tasks` |
| **Automerge** | ✅ Enabled | PRs labeled `automerge` auto-merge after CI passes |
| **Dependabot** | ✅ Active | Weekly GitHub Actions updates, auto-labeled for merge |
| **Auto-labeling** | ✅ Active | PRs auto-labeled `core` or `labs` |
| **Failure Tracker** | ✅ Active | Auto-creates issues on CI failure |
| **Project Sync** | ✅ Active | PRs synced to GitHub Projects board |
| **CODEOWNERS** | ✅ Set | `@blackboxprogramming` owns all files |
| **Identity JSON** | ✅ Valid | SHA-256 verified identity hash |

---

## Identity

**Hash:** `1ba4761e3dcddbe01d2618c02065fdaa807e8c7824999d702a7a13034fd68533`

**Agent:** Aria
**Machine:** aria64 (Raspberry Pi ARM64)
**Role:** Infrastructure Queen
**Symbol:** 🎵

## Quick Start

### Deploy Website to Cloudflare Pages

```bash
cd website
npx wrangler pages deploy . --project-name=aria-blackroad-me
```

### Run the Cloudflare Worker Locally

```bash
cd website
npx wrangler dev
# API available at http://localhost:8787/api/health
```

### Install CLI Tools

```bash
chmod +x cli/aria cli/lucidia
cp cli/aria cli/lucidia ~/bin/

# Infrastructure status
aria --status

# Cost savings report
aria --savings

# Running services
aria --services
```

### Deploy Forkable Services

```bash
bash scripts/deploy-forkies-properly.sh
```

## API Endpoints (Cloudflare Worker)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check with uptime |
| `/api/identity` | GET | Aria's identity JSON |
| `/api/status` | GET | Full infrastructure status |
| `/api/tasks` | POST | Queue a long-running task |
| `/api/tasks/:id` | GET | Check task status |

**Example:**

```bash
curl https://aria-blackroad-me.pages.dev/api/health
```

## GitHub Actions Workflows

All actions are **pinned to commit hashes** for supply-chain security:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `core-ci.yml` | Push/PR to main | Validates HTML, JSON, shell scripts, scans for secrets |
| `deploy.yml` | Push to main (website/) | Deploys to Cloudflare Pages via `wrangler-action` |
| `automerge.yml` | PR events | Auto-merges PRs labeled `automerge` |
| `auto-label.yml` | PR opened | Labels PRs as `core` or `labs` |
| `failure-issue.yml` | CI failure | Creates tracking issue on CI failure |
| `project-sync.yml` | PR opened | Syncs PRs to GitHub Projects |

## Cost Savings

**SaaS → Forkables:** $2,988/year
- Algolia → Meilisearch: $588/year
- AWS S3 → MinIO: $600/year
- Datadog → Prometheus+Grafana: $600/year
- Auth0 → Keycloak: $300/year
- Salesforce → EspoCRM: $900/year

**Infrastructure Migration:** $648/year
- DigitalOcean → Oracle Cloud Free: $648/year

**Total Annual Savings:** $3,636/year

## Forkable Services

| Service | Port | Replaces | Annual Savings |
|---------|------|----------|----------------|
| Meilisearch | 7700 | Algolia | $588 |
| MinIO | 9000-9001 | AWS S3 | $600 |
| Prometheus | 9091 | Datadog | $600 |
| Keycloak | 5432 | Auth0 | $300 |
| Headscale UI | 8081 | Tailscale | $0 |
| EspoCRM | 3306 | Salesforce | $900 |

## Deployments

- **Global CDN:** Cloudflare Pages (`aria-blackroad-me.pages.dev`)
- **Alice Pi:** `http://192.168.4.38:8877` (local network)
- **Lucidia Pi:** `http://192.168.4.99:8866` (local network)

## Sister Agents

- 🧬 **Lucidia** - AI/ML & Analysis Specialist
- 🌌 **Alice** - Staging & Migration Specialist
- 💬 **Cecilia** - Claude Coordination

## Directory Structure

```
aria-infrastructure-queen/
├── .github/
│   ├── CODEOWNERS                # Code ownership
│   ├── dependabot.yml            # Dependency updates
│   └── workflows/
│       ├── auto-label.yml        # PR auto-labeling
│       ├── automerge.yml         # PR automerge
│       ├── core-ci.yml           # CI pipeline
│       ├── deploy.yml            # Cloudflare deployment
│       ├── failure-issue.yml     # CI failure tracking
│       └── project-sync.yml     # Project board sync
├── cli/
│   ├── aria                      # Infrastructure Queen CLI
│   └── lucidia                   # AI/ML Specialist CLI
├── docs/                         # Guides and documentation
├── identity/
│   └── ARIA_IDENTITY.json        # Verified identity
├── scripts/                      # Deployment and automation
├── website/
│   ├── index.html                # Interactive portal
│   ├── worker.js                 # Cloudflare Worker API
│   └── wrangler.toml             # Cloudflare config
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## 📜 License & Copyright

**Copyright © 2026 BlackRoad OS, Inc. All Rights Reserved.**

**CEO:** Alexa Amundson | **PROPRIETARY AND CONFIDENTIAL**

This software is NOT for commercial resale. Testing purposes only.

### 🏢 Enterprise Scale:
- 30,000 AI Agents
- 30,000 Human Employees

**Contact:** blackroad.systems@gmail.com

See [LICENSE](LICENSE) for complete terms.
