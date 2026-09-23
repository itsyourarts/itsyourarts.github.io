#!/usr/bin/env bash
# GodxShadow → GitHub in one command.
# Usage:  bash push-to-github.sh <your-username> <your-repo-name>
# Then:   GitHub → Settings → Pages → Source: "GitHub Actions" (site auto-deploys)
set -euo pipefail

USER_NAME="${1:-}"
REPO_NAME="${2:-}"
if [ -z "$USER_NAME" ] || [ -z "$REPO_NAME" ]; then
  echo "usage: bash push-to-github.sh <github-username> <repo-name>"
  exit 1
fi

cd "$(dirname "$0")"

if [ ! -d .git ]; then
  git init -b main
fi

git add -A
git -c user.email="$USER_NAME@users.noreply.github.com" -c user.name="$USER_NAME" \
    commit -m "GodxShadow — 561 chapters, 35 courses, live code runner" || echo "(nothing new to commit)"

git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${USER_NAME}/${REPO_NAME}.git"
git push -u origin main

echo
echo "✅ pushed → https://github.com/${USER_NAME}/${REPO_NAME}"
echo "   Static site (GitHub Pages): https://${USER_NAME}.github.io/${REPO_NAME}/"
echo "   Full runner: deploy the same repo on Render with render.yaml (see README → Deploy)."
