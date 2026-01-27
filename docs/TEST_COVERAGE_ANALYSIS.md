# Test Coverage Analysis Report

**Date:** 2026-01-27
**Repository:** aria-infrastructure-queen
**Current Coverage:** 0%

---

## Executive Summary

This codebase currently has **zero automated test coverage**. All ~1,210 lines of executable code (CLI tools, deployment scripts, and web interface) are untested. This represents a significant risk for infrastructure automation code that manages cloud deployments, cost auditing, and service orchestration.

---

## Current State

### Code Inventory

| Component | Type | Lines | Tests | Risk Level |
|-----------|------|-------|-------|------------|
| `cli/aria` | Bash CLI | 231 | 0 | Critical |
| `cli/lucidia` | Bash CLI | 265 | 0 | Critical |
| `scripts/deploy-priority-forkies.sh` | Bash | 165 | 0 | Critical |
| `scripts/aria-deploy-identity-everywhere.sh` | Bash | 144 | 0 | High |
| `scripts/migrate-to-oracle-free.sh` | Bash | 112 | 0 | Critical |
| `scripts/deploy-forkies-properly.sh` | Bash | 104 | 0 | High |
| `scripts/audit-all-costs.sh` | Bash | 83 | 0 | Medium |
| `scripts/fix-restarting-services.sh` | Bash | 44 | 0 | High |
| `scripts/deploy-to-alice.sh` | Bash | 31 | 0 | Medium |
| `scripts/deploy-to-lucidia.sh` | Bash | 31 | 0 | Medium |
| `website/index.html` | HTML/JS | 324 | 0 | Medium |

### Testing Infrastructure

- **Test Frameworks:** None configured
- **CI/CD Testing:** Placeholder only (`core-ci.yml` contains `echo "Add lint/test here"`)
- **Test Directories:** None
- **Coverage Tools:** None

---

## Recommended Test Improvements

### Priority 1: CLI Tools (Critical)

#### `cli/aria` - Infrastructure Queen CLI

**Why it needs tests:**
- Core tool used for infrastructure management
- Multiple subcommands with different code paths (`--status`, `--services`, `--savings`, `--interactive`)
- File system operations (`init_aria` creates directories and config files)
- External dependencies (Docker commands)

**Recommended tests using [BATS](https://github.com/bats-core/bats-core):**

```bash
# tests/aria.bats

@test "aria --help displays help message" {
    run ./cli/aria --help
    [ "$status" -eq 0 ]
    [[ "$output" == *"USAGE:"* ]]
    [[ "$output" == *"OPTIONS:"* ]]
}

@test "aria --version displays version" {
    run ./cli/aria --version
    [ "$status" -eq 0 ]
    [[ "$output" == *"v1.0.0"* ]]
}

@test "aria initializes config directory" {
    export HOME=$(mktemp -d)
    run ./cli/aria --help
    [ -d "$HOME/.aria" ]
    [ -d "$HOME/.aria/conversations" ]
}

@test "aria --status shows infrastructure status" {
    run ./cli/aria --status
    [ "$status" -eq 0 ]
    [[ "$output" == *"DEPLOYMENT STATUS"* ]]
    [[ "$output" == *"SERVICES"* ]]
}

@test "aria --savings shows cost report" {
    run ./cli/aria --savings
    [ "$status" -eq 0 ]
    [[ "$output" == *"Cost Savings Report"* ]]
    [[ "$output" == *"TOTAL ANNUAL SAVINGS"* ]]
}
```

**Test coverage targets:**
- [ ] All CLI flags parse correctly
- [ ] `init_aria()` creates correct directory structure
- [ ] `init_aria()` generates valid JSON config
- [ ] `show_status()` output format is consistent
- [ ] `show_savings()` calculations are accurate
- [ ] `show_services()` handles missing Docker gracefully
- [ ] Interactive mode handles all commands
- [ ] Unknown commands don't crash

---

### Priority 2: Deployment Scripts (Critical)

#### `scripts/deploy-priority-forkies.sh`

**Why it needs tests:**
- Deploys 6 critical services to production
- Creates directories and configuration files
- Runs Docker containers with specific parameters
- Hardcoded credentials (security concern)

**Recommended tests:**

```bash
# tests/deploy-priority-forkies.bats

setup() {
    export TEST_DIR=$(mktemp -d)
    export HOME="$TEST_DIR"
    # Mock docker command
    function docker() { echo "MOCK: docker $@"; }
    export -f docker
}

teardown() {
    rm -rf "$TEST_DIR"
}

@test "creates required directories" {
    source ./scripts/deploy-priority-forkies.sh
    [ -d "$HOME/forkies/meilisearch" ]
    [ -d "$HOME/forkies/minio" ]
    [ -d "$HOME/forkies/prometheus" ]
    [ -d "$HOME/forkies/grafana" ]
    [ -d "$HOME/forkies/headscale" ]
    [ -d "$HOME/forkies/keycloak" ]
}

@test "generates valid prometheus config" {
    source ./scripts/deploy-priority-forkies.sh
    [ -f "$HOME/forkies/prometheus/prometheus.yml" ]
    # Validate YAML syntax
    python3 -c "import yaml; yaml.safe_load(open('$HOME/forkies/prometheus/prometheus.yml'))"
}

@test "generates valid headscale config" {
    source ./scripts/deploy-priority-forkies.sh
    [ -f "$HOME/forkies/headscale/config.yaml" ]
    python3 -c "import yaml; yaml.safe_load(open('$HOME/forkies/headscale/config.yaml'))"
}
```

**Test coverage targets:**
- [ ] All directories are created with correct permissions
- [ ] Generated YAML configs are syntactically valid
- [ ] Docker commands use correct image tags
- [ ] Port mappings don't conflict
- [ ] Volume mounts point to correct paths
- [ ] Environment variables are set correctly
- [ ] Script fails gracefully if Docker is unavailable

---

### Priority 3: Cost Audit Script (High)

#### `scripts/audit-all-costs.sh`

**Why it needs tests:**
- Financial calculations must be accurate
- Runs external CLI tools (railway, vercel, doctl, wrangler, docker)
- Output format used for cost reporting

**Recommended tests:**

```bash
# tests/audit-all-costs.bats

@test "handles missing railway CLI gracefully" {
    # Ensure railway is not in PATH
    PATH="/usr/bin:/bin"
    run ./scripts/audit-all-costs.sh
    [ "$status" -eq 0 ]
    [[ "$output" == *"Railway CLI not installed"* ]]
}

@test "handles missing vercel CLI gracefully" {
    PATH="/usr/bin:/bin"
    run ./scripts/audit-all-costs.sh
    [ "$status" -eq 0 ]
    [[ "$output" == *"Vercel CLI not installed"* ]]
}

@test "displays cost summary section" {
    run ./scripts/audit-all-costs.sh
    [ "$status" -eq 0 ]
    [[ "$output" == *"COST SUMMARY"* ]]
    [[ "$output" == *"FREE Services"* ]]
    [[ "$output" == *"PAID Services"* ]]
}

@test "displays target cost" {
    run ./scripts/audit-all-costs.sh
    [[ "$output" == *"TARGET: \$17/month"* ]]
}
```

---

### Priority 4: Website JavaScript (Medium)

#### `website/index.html` - Chat Interface

**Why it needs tests:**
- User-facing interface
- Chat logic with keyword matching
- DOM manipulation

**Recommended tests using Jest + jsdom:**

```javascript
// tests/website.test.js
const { JSDOM } = require('jsdom');
const fs = require('fs');

describe('Aria Chat Interface', () => {
    let dom, document, window;

    beforeEach(() => {
        const html = fs.readFileSync('./website/index.html', 'utf8');
        dom = new JSDOM(html, { runScripts: 'dangerously' });
        document = dom.window.document;
        window = dom.window;
    });

    test('getAriaResponse returns cost savings for cost-related queries', () => {
        const response = window.getAriaResponse('what are the cost savings?');
        expect(response).toContain('$2,136');
        expect(response).toContain('savings');
    });

    test('getAriaResponse returns infrastructure status for status queries', () => {
        const response = window.getAriaResponse('show me infrastructure status');
        expect(response).toContain('Cloudflare Pages');
        expect(response).toContain('operational');
    });

    test('getAriaResponse returns automation info for automation queries', () => {
        const response = window.getAriaResponse('what automation is running?');
        expect(response).toContain('auto-healing');
        expect(response).toContain('auto-scaling');
    });

    test('getAriaResponse returns forkable info for forkable queries', () => {
        const response = window.getAriaResponse('tell me about forkables');
        expect(response).toContain('Meilisearch');
        expect(response).toContain('MinIO');
    });

    test('addMessage appends message to chat', () => {
        window.addMessage('user', 'test message');
        const messages = document.querySelectorAll('.message');
        expect(messages.length).toBeGreaterThan(1);
    });

    test('sendMessage clears input after sending', () => {
        const input = document.getElementById('messageInput');
        input.value = 'test';
        window.sendMessage();
        expect(input.value).toBe('');
    });
});
```

---

### Priority 5: Integration Tests (High Value)

**End-to-end deployment validation:**

```bash
# tests/integration/deploy-integration.bats

@test "full deployment creates all services" {
    # Use docker-compose for isolated testing
    docker-compose -f tests/docker-compose.test.yml up -d

    # Wait for services
    sleep 30

    # Verify each service is accessible
    curl -f http://localhost:7700/health  # Meilisearch
    curl -f http://localhost:9000/minio/health/live  # MinIO
    curl -f http://localhost:9090/-/healthy  # Prometheus
    curl -f http://localhost:3000/api/health  # Grafana

    docker-compose -f tests/docker-compose.test.yml down
}
```

---

## Implementation Roadmap

### Phase 1: Testing Infrastructure Setup (Week 1)

1. **Install BATS for Bash testing:**
   ```bash
   npm install -g bats
   # or
   brew install bats-core
   ```

2. **Create test directory structure:**
   ```
   tests/
   ├── cli/
   │   ├── aria.bats
   │   └── lucidia.bats
   ├── scripts/
   │   ├── deploy-priority-forkies.bats
   │   ├── audit-all-costs.bats
   │   └── migrate-to-oracle-free.bats
   ├── website/
   │   └── chat.test.js
   ├── integration/
   │   └── deploy-integration.bats
   └── helpers/
       └── mock_docker.bash
   ```

3. **Update CI/CD pipeline:**
   ```yaml
   # .github/workflows/core-ci.yml
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Install BATS
           run: npm install -g bats
         - name: Run CLI tests
           run: bats tests/cli/
         - name: Run script tests
           run: bats tests/scripts/
   ```

### Phase 2: CLI Tests (Week 2)

- Write tests for `cli/aria` (target: 80% coverage)
- Write tests for `cli/lucidia` (target: 80% coverage)
- Add argument parsing edge cases
- Test error handling paths

### Phase 3: Script Tests (Week 3-4)

- Write tests for all deployment scripts
- Create Docker mocking helpers
- Test configuration file generation
- Validate YAML/JSON output formats

### Phase 4: Website Tests (Week 5)

- Set up Jest + jsdom
- Test chat response logic
- Test DOM manipulation
- Add snapshot tests for UI

### Phase 5: Integration Tests (Week 6)

- Create docker-compose test environment
- Write end-to-end deployment tests
- Add smoke tests for service health
- Implement automated rollback testing

---

## Security Testing Recommendations

### Credential Scanning

Several scripts contain hardcoded credentials that should be addressed:

| File | Issue |
|------|-------|
| `deploy-priority-forkies.sh:35` | Hardcoded MinIO credentials (`minioadmin/minioadmin`) |
| `deploy-priority-forkies.sh:84` | Hardcoded Grafana password (`admin`) |
| `deploy-priority-forkies.sh:135` | Hardcoded Keycloak credentials (`admin/admin`) |

**Recommendation:** Use environment variables or secrets management, add tests to verify no hardcoded secrets exist.

### Input Validation Tests

```bash
@test "aria rejects malicious input" {
    run ./cli/aria '$(rm -rf /)'
    # Should not execute the subcommand
    [ -d "/bin" ]  # System still intact
}
```

---

## Metrics & Goals

| Metric | Current | 3-Month Target | 6-Month Target |
|--------|---------|----------------|----------------|
| Test Coverage | 0% | 50% | 80% |
| Test Files | 0 | 10 | 20 |
| CI Test Jobs | 0 | 3 | 5 |
| Integration Tests | 0 | 2 | 5 |

---

## Conclusion

The lack of test coverage in this infrastructure automation codebase represents a significant operational risk. Scripts that manage Docker deployments, cloud migrations, and cost calculations run without any automated validation.

**Immediate actions recommended:**

1. Set up BATS testing framework this week
2. Write tests for the two CLI tools (`aria`, `lucidia`)
3. Update CI/CD to run tests on every PR
4. Add pre-commit hooks to run tests locally

**High-impact, low-effort wins:**

1. Test CLI flag parsing (catches common issues)
2. Validate generated YAML/JSON files (prevents deployment failures)
3. Test error handling for missing dependencies (improves reliability)

The investment in testing will pay dividends in reliability, confidence in deployments, and reduced debugging time when issues occur.
