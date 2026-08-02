#!/usr/bin/env bash
# Ledgera secret gate — installs git hooks (pre-commit, pre-push).
# Run: bash .githooks/install.sh
set -euo pipefail

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_DIR="$(git rev-parse --git-dir)"

for hook in pre-commit pre-push; do
  install -m 0755 "${HOOK_DIR}/${hook}" "${GIT_DIR}/hooks/${hook}"
  echo "installed: ${GIT_DIR}/hooks/${hook}"
done

echo "gitleaks hooks installed."
