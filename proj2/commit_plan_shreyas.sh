#!/usr/bin/env bash
set -euo pipefail

# ---------- Config ----------
DEV_NAME="Shreyas"
BRANCH="feature/admin-backend"
REPO_ROOT="$(git rev-parse --show-toplevel)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# The project subfolder that contains admin/, backend/, client/ etc.
PROJ_DIR="${SCRIPT_DIR}"

echo "🚀 Staging & committing files for ${DEV_NAME} (feature-grouped)..."

# ---------- Pre-flight checks ----------
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Not inside a git repository. Abort."
  exit 1
fi

# Warn if user.name/email missing (don't set automatically)
if ! git config user.name >/dev/null; then
  echo "⚠️  git user.name is not set (git config user.name \"Your Name\")."
fi
if ! git config user.email >/dev/null; then
  echo "⚠️  git user.email is not set (git config user.email you@example.com)."
fi

# ---------- Global cleanup/ignores at repo root ----------
pushd "${REPO_ROOT}" >/dev/null

# Ensure .gitignore has common ignores
touch .gitignore
add_ignore() {
  local pattern="$1"
  grep -qxF "$pattern" .gitignore || echo "$pattern" >> .gitignore
}
add_ignore ".DS_Store"
add_ignore "proj2.zip"
add_ignore "*.env"
add_ignore "*.log"
add_ignore "node_modules/"
add_ignore "dist/"
add_ignore "build/"

# Remove any tracked macOS DS_Store files (root or nested)
git rm -r --cached --quiet -- "*.DS_Store" .DS_Store 2>/dev/null || true

# Make sure zip isn't accidentally staged
git reset --quiet proj2.zip 2>/dev/null || true

popd >/dev/null

# ---------- Branch setup ----------
current_branch="$(git symbolic-ref --short HEAD)"
if [[ "$current_branch" != "$BRANCH" ]]; then
  if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
    git switch "$BRANCH"
  else
    git switch -c "$BRANCH"
  fi
fi
echo "📦 On branch $(git branch --show-current)"

# ---------- Optional env hygiene (backend) ----------
if [[ -d "${PROJ_DIR}/backend" ]]; then
  if [[ -f "${PROJ_DIR}/backend/.env" && ! -f "${PROJ_DIR}/backend/.env.example" ]]; then
    cp "${PROJ_DIR}/backend/.env" "${PROJ_DIR}/backend/.env.example" || true
  fi
  # Ensure backend/.gitignore exists and ignores .env and uploads
  touch "${PROJ_DIR}/backend/.gitignore"
  if ! grep -qxF ".env" "${PROJ_DIR}/backend/.gitignore"; then echo ".env" >> "${PROJ_DIR}/backend/.gitignore"; fi
  if ! grep -qxF "uploads/" "${PROJ_DIR}/backend/.gitignore"; then echo "uploads/" >> "${PROJ_DIR}/backend/.gitignore"; fi
fi

# ---------- Commit plan (feature-grouped) ----------
# 1) Admin app
if [[ -d "${PROJ_DIR}/admin" ]]; then
  echo "🧩 Commit 1: admin app (config, public, vite, packages)"
  git add "${PROJ_DIR}/admin/.eslintrc.cjs" 2>/dev/null || true
  git add "${PROJ_DIR}/admin/.gitignore" 2>/dev/null || true
  git add "${PROJ_DIR}/admin/README.md" 2>/dev/null || true
  git add "${PROJ_DIR}/admin/index.html" 2>/dev/null || true
  git add "${PROJ_DIR}/admin/package.json" "${PROJ_DIR}/admin/package-lock.json" 2>/dev/null || true
  git add "${PROJ_DIR}/admin/public" 2>/dev/null || true
  git add "${PROJ_DIR}/admin/vite.config.js" 2>/dev/null || true
  git commit -m "feat(admin): add admin app (config, public, vite, packages)" || true
fi

# 2) Backend API
if [[ -d "${PROJ_DIR}/backend" ]]; then
  echo "🧩 Commit 2: backend API (routes, controllers, models, server)"
  git add "${PROJ_DIR}/backend/config" 2>/dev/null || true
  git add "${PROJ_DIR}/backend/controllers" 2>/dev/null || true
  git add "${PROJ_DIR}/backend/middleware" 2>/dev/null || true
  git add "${PROJ_DIR}/backend/models" 2>/dev/null || true
  git add "${PROJ_DIR}/backend/routes" 2>/dev/null || true
  git add "${PROJ_DIR}/backend/server.js" 2>/dev/null || true
  git add "${PROJ_DIR}/backend/package.json" "${PROJ_DIR}/backend/package-lock.json" 2>/dev/null || true
  # Note: backend/uploads is ignored via backend/.gitignore; don't commit binaries
  git commit -m "feat(backend): add express API (routes, controllers, models, server)" || true

  # Env example & ignores commit (idempotent)
  if [[ -f "${PROJ_DIR}/backend/.env.example" || -f "${PROJ_DIR}/backend/.gitignore" ]]; then
    git add "${PROJ_DIR}/backend/.env.example" "${PROJ_DIR}/backend/.gitignore" 2>/dev/null || true
    git commit -m "chore(backend): add env example and gitignore" || true
  fi
fi

# 3) Commit the plan & PR checklist if present
if [[ -f "${PROJ_DIR}/PR_checklist_Shreyas.md" || -f "${PROJ_DIR}/commit_plan_shreyas.sh" ]]; then
  echo "🧩 Commit 3: PR checklist & commit plan"
  git add "${PROJ_DIR}/PR_checklist_Shreyas.md" 2>/dev/null || true
  git add "${PROJ_DIR}/commit_plan_shreyas.sh" 2>/dev/null || true
  git commit -m "chore: add PR checklist and commit plan script" || true
fi

# 4) Global ignore updates at root
echo "🧩 Commit 4: global ignores (.DS_Store, proj2.zip)"
pushd "${REPO_ROOT}" >/dev/null
git add .gitignore 2>/dev/null || true
git commit -m "chore: update global .gitignore (DS_Store, archives, env, builds)" || true
popd >/dev/null

# ---------- Push (auto setup upstream) ----------
echo "⬆️  Pushing branch with upstream..."
if ! git config --global push.autoSetupRemote >/dev/null 2>&1; then
  git config --global push.autoSetupRemote matching || true
fi

git push -u origin "${BRANCH}" || {
  echo "❗ Push failed. Check GitHub permissions for this repo."
  echo "   If you are pushing to someone else's repo, ensure you have collaborator access"
  echo "   or push to your fork instead:"
  echo "     git remote add myfork https://github.com/<your-username>/SE_G25.git"
  echo "     git push -u myfork ${BRANCH}"
  exit 1
}

echo "✅ Done. Create a PR from ${BRANCH}."
