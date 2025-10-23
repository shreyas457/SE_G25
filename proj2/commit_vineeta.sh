#!/usr/bin/env bash
set -euo pipefail

# === Config ===
BRANCH="${1:-dev/vineeta/phase-01}"
PUSH="${PUSH:-1}"   # set PUSH=0 to skip pushing (dry run)
REMOTE="${REMOTE:-origin}"

echo "➡️  Starting Phase 2 partial commit (~25%) on branch: $BRANCH"

# Ensure repo
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "❌ Not a git repository. Run this from the project root."; exit 1;
}

# Create/switch branch
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "🔀 Switching to existing branch: $BRANCH"
  git checkout "$BRANCH"
else
  echo "🌱 Creating branch: $BRANCH"
  git checkout -b "$BRANCH"
fi

echo
echo "==============================="
echo " Commit 1: Backend Food slice "
echo "==============================="
# Add only the Food domain (model/route/controller). No cart/order.
git add -v \
  backend/controllers/foodController.js \
  backend/models/foodModel.js \
  backend/routes/foodRoute.js

git commit -m "feat(backend/food): add food model, controller, and routes (no cart/order yet)"

echo
echo "=============================================="
echo " Commit 2: Frontend checkout flow scaffolding "
echo "=============================================="
# Add checkout-related pages & theme context (keeps cart/order pages out)
git add -v \
  frontend/src/Context/ThemeContext.jsx \
  frontend/src/pages/PlaceOrder/PlaceOrder.jsx \
  frontend/src/pages/PlaceOrder/PlaceOrder.css \
  frontend/src/pages/Verify/Verify.jsx \
  frontend/src/pages/Verify/Verify.css

git commit -m "feat(frontend): add ThemeContext + PlaceOrder & Verify pages (checkout skeleton)"

echo
echo "====================================="
echo " Commit 3: Minimal shared UI assets  "
echo "====================================="
# Add a tiny set of assets and public header used across shells (keep small)
# (Avoids bulk asset push; MOST assets still excluded)
ASSET_LIST=()
[ -f frontend/public/header_img.png ] && ASSET_LIST+=("frontend/public/header_img.png")
[ -f frontend/src/assets/parcel_icon.png ] && ASSET_LIST+=("frontend/src/assets/parcel_icon.png")
[ -f frontend/src/assets/checked.png ] && ASSET_LIST+=("frontend/src/assets/checked.png")
[ -f frontend/src/assets/un_checked.png ] && ASSET_LIST+=("frontend/src/assets/un_checked.png")
[ -f frontend/src/assets/selector_icon.png ] && ASSET_LIST+=("frontend/src/assets/selector_icon.png")

if [ "${#ASSET_LIST[@]}" -gt 0 ]; then
  git add -v "${ASSET_LIST[@]}"
  git commit -m "chore(assets): add minimal shared UI assets for checkout & theming"
else
  echo "ℹ️ Skipping asset commit (no minimal assets found)."
fi

echo
echo "✅ Phase 2 (~25%) staged in 2–3 commits."
git status --short

if [ "${PUSH}" = "1" ]; then
  echo
  echo "🚀 Pushing branch to $REMOTE/$BRANCH"
  git push -u "$REMOTE" "$BRANCH"
  echo
  echo "👉 Create a PR from $BRANCH titled:"
  echo "   'Phase 1: backend Food + frontend checkout scaffolding'"
else
  echo "ℹ️ PUSH=0 so nothing was pushed. Review locally, then:"
  echo "   git push -u $REMOTE $BRANCH"
fi

echo "🎉 Done."