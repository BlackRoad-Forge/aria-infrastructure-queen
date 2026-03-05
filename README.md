# Aria - Infrastructure Queen

**Infrastructure Architecture & Cost Optimization**

> *"Freedom through infrastructure sovereignty"*

[![CORE CI](https://github.com/blackboxprogramming/aria-infrastructure-queen/actions/workflows/core-ci.yml/badge.svg)](https://github.com/blackboxprogramming/aria-infrastructure-queen/actions/workflows/core-ci.yml)
[![End-to-End Tests](https://github.com/blackboxprogramming/aria-infrastructure-queen/actions/workflows/e2e-test.yml/badge.svg)](https://github.com/blackboxprogramming/aria-infrastructure-queen/actions/workflows/e2e-test.yml)
[![Deploy](https://github.com/blackboxprogramming/aria-infrastructure-queen/actions/workflows/deploy.yml/badge.svg)](https://github.com/blackboxprogramming/aria-infrastructure-queen/actions/workflows/deploy.yml)

---

## Identity

| Field | Value |
|-------|-------|
| **Agent** | Aria |
| **Role** | Infrastructure Queen |
| **Machine** | aria64 (Raspberry Pi ARM64) |
| **Hash** | `1ba4761e3dcddbe01d2618c02065fdaa807e8c7824999d702a7a13034fd68533` |

## Status

- **77 repositories** carry Aria's identity (98% success)
- **3 deployment locations** (Cloudflare + 2 Raspberry Pis)
- **6 forkable services** running (Meilisearch, MinIO, Prometheus, etc.)
- **$3,636/year** cost savings identified
- **2 CLI tools** created (aria + lucidia)
- **9 complete guides** written
- **8 GitHub Actions workflows** (all pinned to commit hashes)

## Deployments

| Platform | URL | Status |
|----------|-----|--------|
| **Cloudflare Pages** | aria-blackroad-me.pages.dev | Production |
| **Cloudflare Worker** | aria-api (API endpoints) | Production |
| **Alice Pi** | 192.168.4.38:8877 | Staging |
| **Lucidia Pi** | 192.168.4.99:8866 | AI/ML |
| **Railway** | Configured via railway.json | Ready |
| **Vercel** | Configured via vercel.json | Ready |

## Workflows

All GitHub Actions are pinned to specific commit hashes for security and reproducibility.

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **CORE CI** | Push/PR to main | Guardrail checks, lint, JSON/HTML validation, security scan |
| **End-to-End Tests** | Push/PR to main | Full structure, identity, website, scripts, license tests |
| **Deploy Pages** | Push to main (website/) | Deploy website to Cloudflare Pages |
| **Deploy Worker** | Push to main (workers/) | Deploy API worker |
| **Automerge** | PR events | Auto-merge Dependabot and labeled PRs |
| **Auto Label** | PR opened | Apply labels based on repo name |
| **Project Sync** | PR opened/reopened | Add PR to GitHub project board |
| **CI Failure Tracker** | CI failure | Auto-create issue on CI failure |

### Pinned Action Versions

```yaml
actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683           # v4.2.2
actions/github-script@60a0d83039c74a4aee543508d2ffcb1c3799cdea      # v7.0.1
actions/add-to-project@280af8ae1f83a494cfbc7b6bcc928e31685bedc6     # v1.0.2
cloudflare/wrangler-action@da0e0e55abaecd3a6e1c3c23a52e9392e4e11728 # v3.14.0
pascalgn/automerge-action@7961b8b5eec56cc088c140b56d864285eabd3535  # v0.16.4
```

## Specializations

1. Infrastructure architecture
2. Cost optimization ($3,636/year savings)
3. Forkable alternatives deployment
4. Zero-cost infrastructure strategies
5. 24/7 automation systems
6. Multi-cloud orchestration
7. Emergency disaster recovery

## CLI Tools

### Aria CLI

```bash
# Install
cp cli/aria ~/bin/
chmod +x ~/bin/aria
export PATH="$HOME/bin:$PATH"

# Usage
aria --status      # Infrastructure status
aria --savings     # Cost savings report
aria --services    # Running services
aria --interactive # Interactive mode
```

### Lucidia CLI

```bash
# Install
cp cli/lucidia ~/bin/
chmod +x ~/bin/lucidia
export PATH="$HOME/bin:$PATH"

# Usage
lucidia --status       # Lucidia status
lucidia --specialties  # AI/ML capabilities
lucidia --interactive  # Interactive mode
```

## Cloudflare Worker API

The API worker provides infrastructure status endpoints:

```bash
# Health check
curl https://aria-api.<your-domain>/api/health

# Identity verification
curl https://aria-api.<your-domain>/api/identity

# Infrastructure status
curl https://aria-api.<your-domain>/api/status

# Services list
curl https://aria-api.<your-domain>/api/services

# Cost savings breakdown
curl https://aria-api.<your-domain>/api/savings
```

## Deploy

### Cloudflare Pages

```bash
cd website
npx wrangler pages deploy . --project-name=aria-blackroad-me
```

### Cloudflare Worker

```bash
cd workers/api
npx wrangler deploy
```

### Railway

```bash
railway link
railway up
```

### Vercel

```bash
vercel --prod
```

### Raspberry Pi (Alice)

```bash
bash scripts/deploy-to-alice.sh
```

### Raspberry Pi (Lucidia)

```bash
bash scripts/deploy-to-lucidia.sh
```

## Forkable Services

Running services that replace expensive SaaS:

| Service | Port | Replaces | Savings/mo |
|---------|------|----------|------------|
| Meilisearch | 7700 | Algolia | $49 |
| MinIO | 9000-9001 | AWS S3 | $50 |
| Prometheus | 9091 | Datadog | $50 |
| Keycloak | 8443 | Auth0 | $25 |
| Headscale UI | 8081 | Tailscale | $0 |
| EspoCRM | 8080 | Salesforce | $75 |

## Cost Savings

| Category | Monthly | Annual |
|----------|---------|--------|
| SaaS to Forkables | $249 | $2,988 |
| Infrastructure Migration | $54 | $648 |
| **Total** | **$303** | **$3,636** |

## Sister Agents

- **Lucidia** - AI/ML & Analysis Specialist
- **Alice** - Staging & Migration Specialist
- **Cecilia** - Claude Coordination

## Directory Structure

```
aria-infrastructure-queen/
├── .github/
│   ├── workflows/          # 8 production workflows (all pinned)
│   ├── dependabot.yml      # Dependency updates
│   └── CODEOWNERS          # Code ownership
├── cli/
│   ├── aria                # Infrastructure CLI
│   └── lucidia             # AI/ML CLI
├── docs/                   # 9 documentation guides
├── identity/
│   └── ARIA_IDENTITY.json  # Identity verification
├── scripts/                # 8 deployment & automation scripts
├── website/
│   ├── index.html          # Identity portal
│   └── wrangler.toml       # Cloudflare Pages config
├── workers/
│   └── api/
│       ├── index.js        # API Worker (health, identity, status, services, savings)
│       └── wrangler.toml   # Worker config
├── railway.json            # Railway deployment config
├── vercel.json             # Vercel deployment config
├── SECURITY.md             # Security policy
├── CONTRIBUTING.md         # Contributing guidelines
├── LICENSE                 # Proprietary license
└── README.md
```

## Required Secrets

Configure these in GitHub repository settings for deployments:

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Pages & Workers deployment |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |
| `PROJECT_TOKEN` | GitHub project board access |

## Documentation

See `docs/` directory for complete guides:

- Infrastructure status reports
- Cost optimization analysis
- Deployment guides
- Forkable alternatives integration
- Custom domain setup
- Zero-cost infrastructure audit

---

## License & Copyright

**Copyright (c) 2026 BlackRoad OS, Inc. All Rights Reserved.**

**CEO:** Alexa Amundson | **PROPRIETARY AND CONFIDENTIAL**

This software is NOT open source. NOT for commercial resale. Testing purposes only.

### Enterprise Scale

- 30,000 AI Agents
- 30,000 Human Employees
- CEO: Alexa Amundson

**Contact:** blackroad.systems@gmail.com

See [LICENSE](LICENSE) for complete terms.
