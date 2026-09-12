#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"
RUNTIME_DIR="${RUNTIME_DIR:-$ROOT_DIR/.runtime/opencrvs-countryconfig}"

[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE" >&2; exit 1; }
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

"$ROOT_DIR/deploy/production/prepare-runtime.sh"
"$ROOT_DIR/deploy/production/security-check.sh" "$ENV_FILE"

for cmd in docker ssh rsync openssl; do
  command -v "$cmd" >/dev/null || { echo "Missing command: $cmd" >&2; exit 1; }
done

: "${DOCKERHUB_ACCOUNT:?Missing DOCKERHUB_ACCOUNT}"
: "${DOCKERHUB_REPO:?Missing DOCKERHUB_REPO}"
: "${COUNTRY_CONFIG_VERSION:?Missing COUNTRY_CONFIG_VERSION}"
: "${OPENCRVS_CORE_VERSION:?Missing OPENCRVS_CORE_VERSION}"

IMAGE="${DOCKERHUB_ACCOUNT}/${DOCKERHUB_REPO}:${COUNTRY_CONFIG_VERSION}"
echo "Building country configuration image: $IMAGE"
docker build --pull --no-cache -t "$IMAGE" "$RUNTIME_DIR"
docker push "$IMAGE"

# The official OpenCRVS deployment script performs remote compose retrieval,
# secret rotation, Docker secret creation and docker stack deployment.
DEPLOY_SCRIPT="$RUNTIME_DIR/infrastructure/deployment/deploy.sh"
[[ -x "$DEPLOY_SCRIPT" ]] || chmod +x "$DEPLOY_SCRIPT"

cd "$RUNTIME_DIR"
DOCKERHUB_ACCOUNT="$DOCKERHUB_ACCOUNT" \
DOCKERHUB_REPO="$DOCKERHUB_REPO" \
ALERT_EMAIL="$ALERT_EMAIL" \
MINIO_ROOT_USER="$MINIO_ROOT_USER" \
MINIO_ROOT_PASSWORD="$MINIO_ROOT_PASSWORD" \
"$DEPLOY_SCRIPT" \
  --host="$HOST" \
  --environment=production \
  --ssh_host="$SSH_HOST" \
  --ssh_port="$SSH_PORT" \
  --ssh_user="$SSH_USER" \
  --version="$OPENCRVS_CORE_VERSION" \
  --country_config_version="$COUNTRY_CONFIG_VERSION" \
  --replicas="$REPLICAS"

echo "Deployment command completed."
echo "Verify HTTPS, health endpoints, authentication, RBAC, backups and restore before entering any real citizen data."
