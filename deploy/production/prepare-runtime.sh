#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="${RUNTIME_DIR:-$ROOT_DIR/.runtime/opencrvs-countryconfig}"
UPSTREAM_REPO="https://github.com/opencrvs/opencrvs-countryconfig.git"
UPSTREAM_REF="${OPENCRVS_COUNTRYCONFIG_REF:-develop}"

rm -rf "$RUNTIME_DIR"
mkdir -p "$(dirname "$RUNTIME_DIR")"
git clone --depth 1 --branch "$UPSTREAM_REF" "$UPSTREAM_REPO" "$RUNTIME_DIR"

# Keep RDC-owned code isolated and auditable inside the runtime tree.
mkdir -p "$RUNTIME_DIR/src/rdc"
rsync -a --delete "$ROOT_DIR/countryconfig/src/" "$RUNTIME_DIR/src/rdc/"

COMPOSE="$RUNTIME_DIR/infrastructure/docker-compose.deploy.yml"
[[ -f "$COMPOSE" ]] || { echo "Missing upstream deploy compose" >&2; exit 1; }

# SECURITY-BY-DESIGN PATCHES
# 1. Never publish an insecure Traefik dashboard.
sed -i 's/--api.insecure=true/--api.insecure=false/g' "$COMPOSE"
# 2. Never disable upstream TLS verification between proxy and services.
sed -i 's/--serverstransport.insecureskipverify=true/--serverstransport.insecureskipverify=false/g' "$COMPOSE"
# 3. Do not inherit an upstream maintainer email for ACME certificates.
sed -i 's#--certificatesresolvers.certResolver.acme.email=.*#--certificatesresolvers.certResolver.acme.email=${ALERT_EMAIL}#g' "$COMPOSE"

# Fail closed if dangerous flags remain.
if grep -Eq -- '--api\.insecure=true|--serverstransport\.insecureskipverify=true' "$COMPOSE"; then
  echo "Security patch failed: insecure Traefik settings remain." >&2
  exit 1
fi

# Do not allow runtime secrets to be tracked.
cat >> "$RUNTIME_DIR/.git/info/exclude" <<'EOF'
.env.production
*.pem
*.key
secrets/
EOF

printf 'Prepared secured OpenCRVS runtime at %s\n' "$RUNTIME_DIR"
printf 'RDC configuration copied to %s/src/rdc\n' "$RUNTIME_DIR"
