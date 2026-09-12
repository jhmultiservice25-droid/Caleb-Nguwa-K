#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${1:-$ROOT_DIR/.env.production}"
RUNTIME_DIR="${RUNTIME_DIR:-$ROOT_DIR/.runtime/opencrvs-countryconfig}"

fail() { echo "SECURITY CHECK FAILED: $*" >&2; exit 1; }

[[ -f "$ENV_FILE" ]] || fail "Missing $ENV_FILE"
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

required=(HOST SSH_HOST SSH_PORT SSH_USER ALERT_EMAIL MINIO_ROOT_USER MINIO_ROOT_PASSWORD OPENCRVS_CORE_VERSION COUNTRY_CONFIG_VERSION REPLICAS)
for name in "${required[@]}"; do
  [[ -n "${!name:-}" ]] || fail "Missing required variable: $name"
done

[[ "$HOST" != *example* ]] || fail "HOST still contains an example value"
[[ "$ALERT_EMAIL" != *example* ]] || fail "ALERT_EMAIL still contains an example value"
[[ "$MINIO_ROOT_USER" != CHANGE_ME* ]] || fail "MINIO_ROOT_USER is still a placeholder"
[[ "$MINIO_ROOT_PASSWORD" != CHANGE_ME* ]] || fail "MINIO_ROOT_PASSWORD is still a placeholder"
(( ${#MINIO_ROOT_PASSWORD} >= 32 )) || fail "MINIO_ROOT_PASSWORD must be at least 32 characters"
[[ "$SSH_PORT" =~ ^[0-9]+$ ]] || fail "SSH_PORT must be numeric"
[[ "$REPLICAS" =~ ^(1|3|5)$ ]] || fail "REPLICAS must be 1, 3 or 5"

# Production must use HTTPS-capable DNS hostname, not localhost/IP literals.
[[ "$HOST" != "localhost" ]] || fail "Production HOST cannot be localhost"
[[ ! "$HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] || fail "Use a DNS hostname for TLS, not a raw IPv4 address"

if [[ -d "$RUNTIME_DIR" ]]; then
  COMPOSE="$RUNTIME_DIR/infrastructure/docker-compose.deploy.yml"
  [[ -f "$COMPOSE" ]] || fail "Runtime compose missing"
  ! grep -Eq -- '--api\.insecure=true|--serverstransport\.insecureskipverify=true' "$COMPOSE" || \
    fail "Unsafe Traefik flags detected"
fi

# Secret hygiene in our own repository.
if git -C "$ROOT_DIR" grep -nE '(BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|MINIO_ROOT_PASSWORD=.{16,}|PASSWORD=CHANGE_ME_[A-Za-z0-9]{8,})' -- ':!deploy/production/.env.example' >/tmp/opencrvs-secret-scan.txt 2>/dev/null; then
  cat /tmp/opencrvs-secret-scan.txt >&2
  fail "Potential secret material committed to Git"
fi

command -v openssl >/dev/null || fail "openssl is required"
command -v ssh >/dev/null || fail "ssh is required"

echo "Security preflight passed."
