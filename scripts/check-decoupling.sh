#!/usr/bin/env bash
# Architectural guards that keep the layers decoupled. Run in CI via `pnpm lint`.
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0

# 1) The renderer must reach the backend only through useApi()/ApiProvider.
#    Direct `window.api` access is allowed solely in the provider wiring.
offenders=$(grep -rln "window\.api" ui/src --include='*.ts' --include='*.tsx' \
  | grep -vE "ui/src/main\.tsx|ui/src/api/ApiContext\.tsx|ui/src/types/electron\.d\.ts" || true)
if [ -n "$offenders" ]; then
  echo "✗ Decoupling guard: window.api used outside the provider wiring:"
  echo "$offenders"
  fail=1
fi

# 2) The core engine must stay framework-agnostic — never import Electron.
if grep -rln "from 'electron'" packages/core/src >/dev/null 2>&1; then
  echo "✗ Decoupling guard: packages/core must not import 'electron':"
  grep -rln "from 'electron'" packages/core/src
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  exit 1
fi
echo "✓ Decoupling guard: renderer uses useApi(); @excalibur/core is Electron-free."
