#!/usr/bin/env bash
set -euo pipefail

if [ -d "apps/frontend/app/api" ]; then
  echo "Error: Next.js API Routes are not allowed in apps/frontend/app/api"
  exit 1
fi

if [ ! -d "apps/backend/src/agents/nodes" ]; then
  echo "Error: Missing required LangGraph nodes directory: apps/backend/src/agents/nodes"
  exit 1
fi

if git ls-files | rg -q '(^|/)\.venv/|(^|/)__pycache__/|\.pyc$'; then
  echo "Error: Tracked hygiene artifacts detected (.venv, __pycache__, .pyc)"
  exit 1
fi

echo "Architecture checks passed"
