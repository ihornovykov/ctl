#!/bin/bash
# server-bootstrap.sh — idempotent first-time setup on the Droplet.
# Safe to run on every deploy; exits quickly when already configured.
# Must be run as the deploy user (sudo used only where required).
set -euo pipefail

NGINX_AVAILABLE="/etc/nginx/sites-available/ctl.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/ctl.conf"
SYSTEMD_UNIT_SERVER="/etc/systemd/system/ctl-server.service"
SYSTEMD_UNIT_WEB="/etc/systemd/system/ctl-web.service"
# Derive root from this script's own location (infra/scripts/server-bootstrap.sh)
# so it works before /opt/ctl/current symlink is flipped on first deploy.
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

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

# ── systemd: API + web ───────────────────────────────────────────────────────
install_unit() {
    local src="$1" dest="$2" name="$3"
    if [ ! -f "$dest" ]; then
        echo "[bootstrap] installing systemd unit $name"
        sudo cp "$src" "$dest"
        sudo systemctl daemon-reload
        sudo systemctl enable "$name"
    elif ! diff -q "$src" "$dest" >/dev/null 2>&1; then
        echo "[bootstrap] systemd unit $name changed — updating"
        sudo cp "$src" "$dest"
        sudo systemctl daemon-reload
    fi
}

install_unit "$REPO_ROOT/infra/systemd/ctl-server.service" "$SYSTEMD_UNIT_SERVER" ctl-server
install_unit "$REPO_ROOT/infra/systemd/ctl-web.service" "$SYSTEMD_UNIT_WEB" ctl-web

echo "[bootstrap] done"
