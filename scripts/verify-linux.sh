#!/usr/bin/env bash
# TDTH-FLAG: Run the unchanged suite from a filesystem path without URL escapes.
set -euo pipefail
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mode=${1:-final}
case "$mode" in
  baseline) log=baseline-contract-linux.txt ;;
  first) log=contract-run-1.txt ;;
  final) log=contract-run-final.txt ;;
  *) printf 'Usage: bash scripts/verify-linux.sh baseline|first|final\n' >&2; exit 2 ;;
esac
if [[ "$mode" == first && -e "$root/$log" ]]; then
  printf 'Refusing to overwrite the first implementation run.\n' >&2
  exit 2
fi
workspace=$(mktemp -d /tmp/ia03-verify.XXXXXX)
printf 'Verification workspace: %s\n' "$workspace"
tar -C "$root" --exclude=.git --exclude=data --exclude=node_modules -cf - . |
  tar -C "$workspace" -xf -
cd "$workspace"
node --version
npm run migrate
npm run seed
npm test 2>&1 | tee "$root/$mode-legacy.txt"
set +e
npm run contract 2>&1 | tee "$root/$log"
result=${PIPESTATUS[0]}
exit "$result"
