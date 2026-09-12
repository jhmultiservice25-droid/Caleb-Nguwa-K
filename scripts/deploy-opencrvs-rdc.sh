#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_DIR="${ROOT_DIR}/.opencrvs/countryconfig-rdc"

if [ ! -d "${CONFIG_DIR}" ]; then
  echo "Environnement absent. Exécution du bootstrap..."
  bash "${ROOT_DIR}/scripts/bootstrap-opencrvs.sh"
fi

if [ ! -f "${CONFIG_DIR}/assets/deployment/deploy.sh" ]; then
  echo "Script de déploiement OpenCRVS introuvable."
  exit 1
fi

cd "${CONFIG_DIR}"

echo "Validation et lancement du déploiement OpenCRVS RDC..."
bash assets/deployment/deploy.sh "$@"
