#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="${ROOT_DIR}/.opencrvs"
CORE_DIR="${WORK_DIR}/opencrvs-core"
RDC_CONFIG_DIR="${WORK_DIR}/countryconfig-rdc"

mkdir -p "${WORK_DIR}"

if [ ! -d "${CORE_DIR}/.git" ]; then
  echo "Clonage du moteur officiel OpenCRVS..."
  git clone --branch develop --depth 1 https://github.com/opencrvs/opencrvs-core.git "${CORE_DIR}"
else
  echo "Mise à jour du moteur OpenCRVS..."
  git -C "${CORE_DIR}" fetch origin develop --depth 1
  git -C "${CORE_DIR}" reset --hard origin/develop
fi

rm -rf "${RDC_CONFIG_DIR}"
mkdir -p "${RDC_CONFIG_DIR}"
cp -R "${CORE_DIR}/packages/countryconfig-template/." "${RDC_CONFIG_DIR}/"

# Superpose notre configuration RDC sur le template officiel.
cp -R "${ROOT_DIR}/countryconfig/." "${RDC_CONFIG_DIR}/"

cat <<'EOF'

OpenCRVS RDC est prêt.

Moteur : .opencrvs/opencrvs-core
Configuration RDC : .opencrvs/countryconfig-rdc

Étapes suivantes :
  cd .opencrvs/opencrvs-core
  corepack enable
  pnpm install

Puis démarrer l'environnement OpenCRVS conformément à la documentation officielle.
EOF
