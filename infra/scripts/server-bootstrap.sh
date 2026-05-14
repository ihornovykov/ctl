#!/bin/bash
# server-bootstrap.sh — idempotent first-time setup on the Droplet.
# Safe to run on every deploy; exits quickly when already configured.
# Must be run as the deploy user (sudo used only where required).
set -euo pipefail

NGINX_AVAILABLE="/etc/nginx/sites-available/ctl.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/ctl.conf"
SYSTEMD_UNIT="/etc/systemd/system/ctl-server.service"
REPO_ROOT="/opt/ctl/current"

echo "[bootstrap] starting"

# ── nginx site config ────────────────────────────────────────────────────────
if [ ! -f "$NGINX_AVAILABLE" ]; then
    echo "[bootstrap] installing nginx site config"
    sudo cp "$REPO_ROOT/infra/nginx/ctl.conf" "$NGINX_AVAILABLE"
    sudo ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl reload nginx
else
    # Update config in case it changed; only reload if nginx -t passes
    if ! diff -q "$REPO_ROOT/infra/nginx/ctl.conf" "$NGINX_AVAILABLE" >/dev/null 2>&1; then
        echo "[bootstrap] nginx config changed — updating"
        sudo cp "$REPO_ROOT/infra/nginx/ctl.conf" "$NGINX_AVAILABLE"
        sudo nginx -t
        sudo systemctl reload nginx
    fi
fi

# ── systemd unit ─────────────────────────────────────────────────────────────
if [ ! -f "$SYSTEMD_UNIT" ]; then
    echo "[bootstrap] installing systemd unit"
    sudo cp "$REPO_ROOT/infra/systemd/ctl-server.service" "$SYSTEMD_UNIT"
    sudo systemctl daemon-reload
    sudo systemctl enable ctl-server
else
    # Update unit file if it changed
    if ! diff -q "$REPO_ROOT/infra/systemd/ctl-server.service" "$SYSTEMD_UNIT" >/dev/null 2>&1; then
        echo "[bootstrap] systemd unit changed — updating"
        sudo cp "$REPO_ROOT/infra/systemd/ctl-server.service" "$SYSTEMD_UNIT"
        sudo systemctl daemon-reload
    fi
fi

echo "[bootstrap] done"
