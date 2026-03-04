#!/bin/bash
set -euo pipefail

# Aria Stripe API - Deploy to Raspberry Pi
# Deploys the Node.js API to Alice (primary) and Lucidia (replica)

PI_ALICE="${PI_ALICE_HOST:-192.168.4.38}"
PI_LUCIDIA="${PI_LUCIDIA_HOST:-192.168.4.99}"
PI_USER="${PI_USER:-pi}"
API_PORT="${API_PORT:-3000}"
APP_DIR="/opt/aria-stripe-api"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

deploy_to_pi() {
  local host="$1"
  local name="$2"

  echo "=== Deploying Aria Stripe API to ${name} (${host}) ==="

  # Copy API code
  echo "  Syncing files..."
  rsync -avz --delete \
    --exclude node_modules \
    --exclude .env \
    --exclude coverage \
    "${REPO_ROOT}/api/" "${PI_USER}@${host}:${APP_DIR}/"

  # Install deps and restart
  echo "  Installing dependencies and restarting..."
  ssh "${PI_USER}@${host}" bash <<REMOTE
    set -e
    cd ${APP_DIR}

    # Install Node.js deps
    npm ci --production 2>&1 | tail -3

    # Create systemd service if not exists
    if [ ! -f /etc/systemd/system/aria-stripe-api.service ]; then
      sudo tee /etc/systemd/system/aria-stripe-api.service > /dev/null <<'SVC'
[Unit]
Description=Aria Stripe API
After=network.target

[Service]
Type=simple
User=${PI_USER}
WorkingDirectory=${APP_DIR}
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
RestartSec=5
EnvironmentFile=${APP_DIR}/.env

[Install]
WantedBy=multi-user.target
SVC
      sudo systemctl daemon-reload
      sudo systemctl enable aria-stripe-api
    fi

    # Restart service
    sudo systemctl restart aria-stripe-api
    sleep 2
    sudo systemctl is-active aria-stripe-api && echo "  Service is running!" || echo "  WARNING: Service failed to start"
REMOTE

  echo "  ${name} deployed: http://${host}:${API_PORT}"
  echo ""
}

echo ""
echo "Aria Infrastructure Queen - Stripe API Deployment"
echo "================================================="
echo ""

# Check which Pis are reachable
ALICE_UP=false
LUCIDIA_UP=false

if ping -c 1 -W 2 "$PI_ALICE" &>/dev/null; then
  ALICE_UP=true
  echo "Alice ($PI_ALICE): reachable"
else
  echo "Alice ($PI_ALICE): unreachable - skipping"
fi

if ping -c 1 -W 2 "$PI_LUCIDIA" &>/dev/null; then
  LUCIDIA_UP=true
  echo "Lucidia ($PI_LUCIDIA): reachable"
else
  echo "Lucidia ($PI_LUCIDIA): unreachable - skipping"
fi

echo ""

if $ALICE_UP; then
  deploy_to_pi "$PI_ALICE" "Alice"
fi

if $LUCIDIA_UP; then
  deploy_to_pi "$PI_LUCIDIA" "Lucidia"
fi

if ! $ALICE_UP && ! $LUCIDIA_UP; then
  echo "ERROR: No Raspberry Pi nodes reachable. Check your network."
  echo "  Alice:   $PI_ALICE"
  echo "  Lucidia: $PI_LUCIDIA"
  exit 1
fi

echo "================================================="
echo "Deployment complete!"
echo ""
echo "API endpoints:"
$ALICE_UP && echo "  Alice:   http://${PI_ALICE}:${API_PORT}/api/health"
$LUCIDIA_UP && echo "  Lucidia: http://${PI_LUCIDIA}:${API_PORT}/api/health"
echo ""
echo "IMPORTANT: Ensure .env file exists on each Pi at ${APP_DIR}/.env"
echo "  Copy api/.env.example and fill in your Stripe keys."
