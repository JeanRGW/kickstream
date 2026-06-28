#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REGION="${AWS_REGION:-us-east-1}"

aws dynamodb batch-write-item \
  --region "$REGION" \
  --request-items "file://$SCRIPT_DIR/seed-dynamodb.json"

aws dynamodb scan \
  --region "$REGION" \
  --table-name kickstream-jogos \
  --select COUNT
