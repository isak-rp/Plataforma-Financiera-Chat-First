#!/usr/bin/env bash
set -euo pipefail

FILE="apps/frontend/lib/api/services.ts"

if [ ! -f "$FILE" ]; then
  echo "Error: missing $FILE"
  exit 1
fi

# Ensure mock mode is opt-in, not default-on.
grep -q 'const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"' "$FILE" || {
  echo "Error: USE_MOCK must be explicit opt-in (NEXT_PUBLIC_USE_MOCK===\"true\")"
  exit 1
}

# Critical endpoint mappings must exist in service layer.
grep -q '"/api/v1/chat"' "$FILE" || { echo "Error: missing /api/v1/chat mapping"; exit 1; }
grep -q '"/api/v1/espacios"' "$FILE" || { echo "Error: missing /api/v1/espacios mapping"; exit 1; }
grep -q '"/api/v1/perfil"' "$FILE" || { echo "Error: missing /api/v1/perfil mapping"; exit 1; }
grep -q '"/api/v1/transacciones"' "$FILE" || { echo "Error: missing /api/v1/transacciones mapping"; exit 1; }
grep -q '/api/v1/transacciones/${transaccionId}/estado' "$FILE" || {
  echo "Error: missing /api/v1/transacciones/{id}/estado mapping"
  exit 1
}

echo "Frontend services smoke checks passed"
