#!/bin/bash
# deploy.sh — runs on the Droplet as the deploy user after rsync.
# Usage: deploy.sh <GIT_SHA>
# The release directory /opt/ctl/releases/<GIT_SHA> must already exist (rsynced by CI).
set -euo pipefail

SHA="${1:?first argument must be the git SHA}"
RELEASE_DIR="/opt/ctl/releases/$SHA"
CURRENT_LINK="/opt/ctl/current"
ENV_FILE="/etc/ctl/server.env"

echo "[deploy] sha=$SHA"

# ── Validate release directory ───────────────────────────────────────────────
if [ ! -d "$RELEASE_DIR" ]; then
    echo "[deploy] ERROR: release directory $RELEASE_DIR not found"
    exit 1
fi

cd "$RELEASE_DIR"

# ── Symlink apps/server/.env -> /etc/ctl/server.env ─────────────────────────
# drizzle.config.ts resolves DATABASE_URL from apps/server/.env
mkdir -p apps/server
ln -sf "$ENV_FILE" apps/server/.env
echo "[deploy] linked apps/server/.env -> $ENV_FILE"

# ── pnpm install ─────────────────────────────────────────────────────────────
echo "[deploy] pnpm install"
pnpm install --frozen-lockfile

# ── Build (web + server via Turborepo) ───────────────────────────────────────
# VITE_SERVER_URL is injected into the environment by CI before this script runs
echo "[deploy] pnpm build"
pnpm build

# ── Database migrations ───────────────────────────────────────────────────────
echo "[deploy] db:migrate"
pnpm db:migrate

# ── Playground Docker image ──────────────────────────────────────────────────
# Rebuild only when infra/playground/** changed relative to the previous release.
PREV_SHA=""
if [ -L "$CURRENT_LINK" ]; then
    PREV_SHA=$(basename "$(readlink "$CURRENT_LINK")" 2>/dev/null || true)
fi

REBUILD_IMAGE=false
if [ -z "$PREV_SHA" ]; then
    echo "[deploy] first deploy — building playground image"
    REBUILD_IMAGE=true
elif git diff --quiet "$PREV_SHA" "$SHA" -- infra/playground/ 2>/dev/null; then
    echo "[deploy] infra/playground unchanged — skipping image build"
else
    echo "[deploy] infra/playground changed — rebuilding image"
    REBUILD_IMAGE=true
fi

if [ "$REBUILD_IMAGE" = "true" ]; then
    pnpm docker:playground
fi

# ── Flip current symlink (atomic) ────────────────────────────────────────────
echo "[deploy] flipping current symlink to $SHA"
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

# ── Restart services ─────────────────────────────────────────────────────────
echo "[deploy] restarting ctl-server"
sudo systemctl restart ctl-server

echo "[deploy] reloading nginx"
sudo systemctl reload nginx

# ── Health check ─────────────────────────────────────────────────────────────
echo "[deploy] health check"
sleep 2
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || echo "000")
if [ "$STATUS" != "200" ]; then
    echo "[deploy] ERROR: health check failed (HTTP $STATUS) — rolling back symlink"
    if [ -n "$PREV_SHA" ]; then
        ln -sfn "/opt/ctl/releases/$PREV_SHA" "$CURRENT_LINK"
        sudo systemctl restart ctl-server
        echo "[deploy] rolled back to $PREV_SHA"
    fi
    exit 1
fi

echo "[deploy] success — running $SHA"

# ── Clean up old releases (keep last 3) ──────────────────────────────────────
ls -1dt /opt/ctl/releases/*/ 2>/dev/null | tail -n +4 | xargs rm -rf --
echo "[deploy] old releases pruned"
