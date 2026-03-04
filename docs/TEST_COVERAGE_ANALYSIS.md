# Test Coverage Analysis

**Date:** 2026-03-04
**Current Coverage:** 0% — No automated tests exist in the repository.

---

## Executive Summary

The aria-infrastructure-queen repository contains **2 CLI tools** (~500 lines of Bash), **8 deployment/automation scripts** (~750 lines of Bash), **1 web interface** (~320 lines of HTML/CSS/JS), and **5 GitHub Actions workflows**. None of these have any automated tests. The CI pipeline (`core-ci.yml`) has only a placeholder for lint and test steps.

This document identifies the highest-impact areas for test coverage and recommends a practical testing strategy.

---

## 1. CLI Tools — HIGH PRIORITY

### `cli/aria` (231 lines)

| Area | What to Test | Risk if Untested |
|------|-------------|------------------|
| `init_aria()` | Creates `~/.aria/` directory and `config.json` with correct structure; is idempotent (doesn't overwrite existing config) | Broken initialization on first run; accidental config overwrite |
| `main()` argument parsing | All flags (`-h`, `-v`, `--status`, `--services`, `--savings`, `-i`, `""`, unknown args) route to the correct function | CLI silently does the wrong thing |
| `show_services()` | Parses `docker ps` output correctly; handles case where no services are running | Misleading service status |
| `show_savings()` | Reported dollar amounts are internally consistent ($249/mo = $2,988/yr, but header says $3,636/yr) | **Inconsistent financial reporting** — current code reports different totals in `show_savings` vs `show_status` |
| Interactive mode | `exit`/`quit` terminates; `help` lists commands; `status`/`services`/`savings`/`deploy` dispatch correctly; empty input is a no-op | Broken interactive session |

### `cli/lucidia` (265 lines)

| Area | What to Test | Risk if Untested |
|------|-------------|------------------|
| `init_lucidia()` | Same idempotency/structure checks as `init_aria` | Same risks |
| `main()` argument parsing | All flags route correctly, including `--new` requiring a prompt argument | Silent misbehavior |
| `list_conversations()` | Handles empty conversation directory; handles populated directory; handles missing directory | Crash or confusing output |
| `--new` without prompt | Should exit with error code 1 and display usage hint | Confusing UX |

### Recommended Tests (BATS)

```bash
# Example: test cli/aria argument routing
@test "aria --version prints version" {
  run ./cli/aria --version
  [[ "$output" == *"Aria CLI v1.0.0"* ]]
}

@test "aria with no args shows help" {
  run ./cli/aria
  [[ "$output" == *"USAGE"* ]]
}

@test "lucidia --new without prompt exits with error" {
  run ./cli/lucidia --new
  [ "$status" -eq 1 ]
  [[ "$output" == *"Error"* ]]
}
```

---

## 2. Deployment Scripts — HIGH PRIORITY

### `scripts/deploy-forkies-properly.sh` (104 lines)

| Area | What to Test | Risk if Untested |
|------|-------------|------------------|
| Directory creation | `~/forkies/` subdirectories are created | Deployment fails on fresh machine |
| MinIO idempotency | Skips deployment if MinIO is already running | Duplicate containers, port conflicts |
| Keycloak/Headscale guards | Correctly detects existing containers | Unnecessary redeployments |
| Prometheus config generation | Generated `prometheus.yml` is valid YAML | Prometheus fails to start |
| Docker run commands | Correct image names, port mappings, volume mounts, env vars | Silent misconfiguration |

### `scripts/deploy-priority-forkies.sh` (165 lines)

| Area | What to Test | Risk if Untested |
|------|-------------|------------------|
| `set -e` behavior | Script aborts on first failure (unlike `deploy-forkies-properly.sh` which doesn't use `set -e`) | Partial deployments go unnoticed |
| Config file generation | `prometheus.yml` and `headscale/config.yaml` are valid | Services fail to start |
| All 6 Docker deployments | Correct images, ports, volumes, environment variables | Misconfigured services |

### `scripts/audit-all-costs.sh` (83 lines)

| Area | What to Test | Risk if Untested |
|------|-------------|------------------|
| Tool detection | Correctly identifies when `railway`, `vercel`, `doctl`, `wrangler` are/aren't installed | False audit results |
| Docker fallback | Handles `docker` not being available | Script crash |
| API key scanning | Detects (or correctly reports absence of) env vars | Security blind spot |

### `scripts/aria-deploy-identity-everywhere.sh` (144 lines)

| Area | What to Test | Risk if Untested |
|------|-------------|------------------|
| Repository enumeration | Correctly lists repos via `gh` CLI | Missed or wrong repos |
| Identity file content | Generated identity JSON is valid and complete | Broken identity deployment |
| Git operations | Commit and push succeed; handles already-up-to-date repos | Failed deployments |

### Recommended Approach

Use **BATS** with mocked Docker/CLI commands. Create a `test/mocks/` directory with stub scripts that simulate `docker`, `gh`, `railway`, etc. This allows testing script logic without requiring actual infrastructure.

---

## 3. Website Chat Logic — MEDIUM PRIORITY

### `website/index.html` — `getAriaResponse()` (lines 263–313)

The chat bot has keyword-matching logic that returns different responses based on user input. This is pure JavaScript and easily testable.

| Area | What to Test | Risk if Untested |
|------|-------------|------------------|
| Keyword matching | "cost", "saving", "status", "infrastructure", "automation", "auto", "forkable", "fork", "hello", "hi" all trigger correct responses | Wrong or generic responses for expected keywords |
| Case insensitivity | `toLowerCase()` is applied before matching | Missed keywords from capitalized input |
| Default response | Unknown input returns the generic help message | Crash or empty response |
| `sendMessage()` | Empty input is rejected; message appears in DOM; input field is cleared | Broken chat UX |
| `addMessage()` | Correct DOM structure, scrolls to bottom | Messages not visible |
| XSS via user input | User-typed HTML/script in chat input is not executed | **Security vulnerability** — current code uses `innerHTML` with unsanitized user input at line 258 |

### Recommended Approach

Extract `getAriaResponse()` into a separate `.js` file and test with a lightweight framework (e.g., Node.js with the built-in `node:test` module, or simply inline `<script>` assertions).

---

## 4. GitHub Actions Workflows — MEDIUM PRIORITY

### `core-ci.yml`

Currently a placeholder. This is the right place to wire in the test suite once it exists.

### `auto-label.yml`, `deploy.yml`, `failure-issue.yml`, `project-sync.yml`

| Area | What to Test | Risk if Untested |
|------|-------------|------------------|
| Label logic | PRs get correct "labs" or "core" label | Mislabeled PRs |
| Deploy triggers | Only triggers on push to main | Accidental deployments |
| Failure tracking | Issues are created with correct metadata | Silent CI failures |

### Recommended Approach

Use [act](https://github.com/nektos/act) for local workflow testing, or write integration tests that validate workflow YAML structure.

---

## 5. Configuration Validation — LOW PRIORITY

### `identity/ARIA_IDENTITY.json`

| Area | What to Test | Risk if Untested |
|------|-------------|------------------|
| JSON validity | File is valid JSON | Tooling that reads it breaks |
| Required fields | `agent_name`, `identity_hash`, `specializations`, etc. are present | Incomplete identity |
| Hash consistency | Identity hash matches what's embedded in CLI tools and website | Identity mismatch across systems |

### `website/wrangler.toml`

| Area | What to Test | Risk if Untested |
|------|-------------|------------------|
| TOML validity | File parses correctly | Deployment failures |
| Project name | Matches expected Cloudflare project | Deploys to wrong project |

---

## 6. Issues Found During Analysis

### Security Issues

1. **Hardcoded credentials in scripts** — `deploy-forkies-properly.sh:23` exposes a Meilisearch master key in plain text. `deploy-priority-forkies.sh` uses default `minioadmin`/`minioadmin` for MinIO and `admin`/`admin` for Grafana and Keycloak. These should be environment variables or secrets.
2. **XSS vulnerability in website chat** — `website/index.html:258` uses `innerHTML` to render user input without sanitization. A user could inject `<script>` tags or event handlers.
3. **API key scanning prints keys** — `audit-all-costs.sh:57-60` runs `env | grep -i openai` and `env | grep -i anthropic`, which would print actual API key values to stdout if they exist.

### Data Consistency Issues

1. **Savings figures are inconsistent** — `cli/aria` `show_savings()` reports $3,636/year total, while `show_status()` reports $3,084/year, the identity JSON says $3,136+/year, and the website says $2,136+/year.

---

## 7. Recommended Implementation Plan

### Phase 1: Foundation (Immediate)

1. Install [BATS](https://github.com/bats-core/bats-core) as the Bash testing framework
2. Create `tests/` directory structure:
   ```
   tests/
   ├── cli/
   │   ├── aria.bats
   │   └── lucidia.bats
   ├── scripts/
   │   ├── deploy-forkies.bats
   │   └── audit-costs.bats
   ├── website/
   │   └── chat.test.js
   ├── validation/
   │   ├── identity.bats
   │   └── workflows.bats
   └── mocks/
       ├── docker
       └── gh
   ```
3. Wire BATS into `core-ci.yml` so tests run on every PR

### Phase 2: Critical Path Tests

4. Write CLI argument-parsing and initialization tests
5. Write deployment script tests with mocked Docker commands
6. Write `getAriaResponse()` unit tests
7. Fix the XSS vulnerability and add a regression test

### Phase 3: Hardening

8. Add configuration validation tests (JSON schema, TOML validity)
9. Add data consistency tests (savings figures match across files)
10. Add shellcheck linting for all Bash scripts
11. Add HTML validation for the website

### Estimated Coverage After Full Implementation

| Component | Files | Current | Target |
|-----------|-------|---------|--------|
| CLI tools | 2 | 0% | 90%+ |
| Deployment scripts | 8 | 0% | 70%+ |
| Website JS logic | 1 | 0% | 85%+ |
| Configuration | 2 | 0% | 100% |
| Workflows | 5 | 0% | 50%+ |
| **Overall** | **18** | **0%** | **75%+** |
