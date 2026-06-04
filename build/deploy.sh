#!/bin/zsh
# 部署到 Cloudflare Pages（排除本地后台/构建/文档；commit message 必须 ASCII）
set -e
cd "$(dirname "$0")/.."
S=$(mktemp -d)
rsync -a \
  --exclude admin.html --exclude '.git' --exclude '.gitignore' --exclude '.assetsignore' \
  --exclude build --exclude docs --exclude test --exclude '.claude' \
  --exclude 'CLAUDE.md' --exclude package.json \
  ./ "$S/"
npx wrangler pages deploy "$S" --project-name=thegametheory --commit-message="${1:-manual deploy}"
rm -rf "$S"
