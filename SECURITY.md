# Security Policy

**Copyright (c) 2026 BlackRoad OS, Inc. All Rights Reserved.**

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Email:** blackroad.systems@gmail.com
2. **Subject:** `[SECURITY] aria-infrastructure-queen - <brief description>`
3. **Do NOT** create a public GitHub issue for security vulnerabilities

## Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 5 business days
- **Resolution:** Based on severity

## Security Practices

- All GitHub Actions are pinned to specific commit hashes
- Dependabot monitors for dependency updates
- CODEOWNERS enforces review requirements
- Proprietary license restricts unauthorized use
- No secrets or credentials stored in repository
- CI pipeline includes automated security scanning

## Scope

This policy covers the `aria-infrastructure-queen` repository and its deployed services:
- Cloudflare Pages deployment
- Cloudflare Workers API
- CLI tools (aria, lucidia)
- Deployment scripts
