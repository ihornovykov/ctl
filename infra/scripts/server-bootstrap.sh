#!/bin/bash
# server-bootstrap.sh — idempotent first-time setup on the Droplet.
# Safe to run on every deploy; exits quickly when already configured.
# Must be run as the deploy user (sudo used only where required).
set -euo pipefail

NGINX_AVAILABLE="/etc/nginx/sites-available/ctl.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/ctl.conf"
SYSTEMD_UNIT_SERVER="/etc/systemd/system/ctl-server.service"
SYSTEMD_UNIT_WEB="/etc/systemd/system/ctl-web.service"
CERT_PATH="/etc/letsencrypt/live/codetolearn.dev/fullchain.pem"
DOMAIN="codetolearn.dev"
CERTBOT_WEBROOT="/var/www/certbot"
# Derive root from this script's own location (infra/scripts/server-bootstrap.sh)
# so it works before /opt/ctl/current symlink is flipped on first deploy.
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "[bootstrap] starting"

# ── certbot (for Let's Encrypt; install once as root on the Droplet) ─────────
if ! command -v certbot >/dev/null 2>&1; then
    echo "[bootstrap] WARNING: certbot not installed — run as root: apt-get install -y certbot"
fi

mkdir -p "$CERTBOT_WEBROOT"

cert_exists() {
    sudo certbot certificates 2>/dev/null | grep -qF "Certificate Name: $DOMAIN"
}

nginx_src_for_cert() {
    if cert_exists; then
        echo "$REPO_ROOT/infra/nginx/ctl.conf"
    else
        echo "$REPO_ROOT/infra/nginx/ctl-http-only.conf"
    fi
}

install_nginx_config() {
    local src
    src="$(nginx_src_for_cert)"
    sudo cp "$src" "$NGINX_AVAILABLE"
    sudo ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl reload nginx
}

# ── nginx site config ─ sibling ────────────────────────────────────────────
nginx_src="$(nginx_src_for_cert)"
if [ "$nginx_src" = "$REPO_ROOT/infra/nginx/ctl-http-only.conf" ]; then
    echo "[bootstrap] TLS cert not found — using HTTP-only nginx config"
fi

if [ ! -f "$NGINX_AVAILABLE" ]; then
    echo "[bootstrap] installing nginx site config"
    install_nginx_config
elif ! diff -q "$nginx_src" "$NGINX_AVAILABLE" >/dev/null 2>&1; then
    echo "[bootstrap] nginx config changed — updating"
    install_nginx_config
fi

# ── TLS certificate (requires DNS A record → this Droplet) ───────────────────
if ! cert_exists; then
  resolved_ip="$(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk '{print $1; exit}' || true)"
  droplet_ip="$(curl -sf -4 --max-time 5 https://api.ipify.org || true)"

  if [ -n "$resolved_ip" ] && [ -n "$droplet_ip" ] && [ "$resolved_ip" = "$droplet_ip" ]; then
    echo "[bootstrap] DNS OK ($DOMAIN → $resolved_ip) — requesting certificate"
    if sudo certbot certonly \
      --webroot \
      -w "$CERTBOT_WEBROOT" \
      -d "$DOMAIN" \
      --non-interactive \
      --agree-tos \
      --register-unsafely-without-email \
      --keep-until-expiring; then
      echo "[bootstrap] certificate issued — switching to HTTPS nginx config"
      install_nginx_config
    else
      echo "[bootstrap] certbot failed — still serving HTTP only"
    fi
  else
    echo "[bootstrap] skipping certbot: $DOMAIN resolves to '${resolved_ip:-unknown}', droplet is '${droplet_ip:-unknown}'"
    echo "[bootstrap] add an A record at name.com: @ → $droplet_ip"
  fi
fi

if cert_exists; then
    nginx_src="$(nginx_src_for_cert)"
    if ! diff -q "$nginx_src" "$NGINX_AVAILABLE" >/dev/null 2>&1; then
        echo "[bootstrap] TLS cert present — enabling HTTPS nginx config"
        install_nginx_config
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

if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
    if ! ufw status | grep -q "443/tcp"; then
        echo "[bootstrap] opening UFW port 443"
        sudo ufw allow 443/tcp || echo "[bootstrap] WARNING: could not open UFW 443 — run as root: ufw allow 443/tcp"
    fi
fi

echo "[bootstrap] done"
