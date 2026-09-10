#!/usr/bin/env bash
# tools/doctor.sh — run this FIRST in any new session.
#
# Checks the things that quietly go wrong and fixes the ones that are safe to
# fix. It never resets, never force-pushes and never deletes anything that git
# cannot hand back — the only thing it changes on its own is re-hiding images,
# which is reversible at any time with `tools/images.sh on`.

cd "$(dirname "$0")/.." || exit 1
echo "── $(basename "$PWD") ─────────────────────────────────"

# ── 1. image hiding ────────────────────────────────────────────────────────
# It is safe to auto-repair: hidden images live in git and in the committed
# data.json, so `images.sh on` always brings them back.
need=0
[ "$(git config --get core.sparseCheckout 2>/dev/null)" = "true" ] || need=1
grep -q 'posts/\*\*/\*\.png' .git/info/sparse-checkout 2>/dev/null || need=1
if [ "$need" = "1" ]; then
  echo "   ⚠️  images were not hidden — re-enabling (recoverable: images.sh on)"
  if ./tools/images.sh safe-off >/dev/null 2>&1; then echo "   ✔ fixed"
  else echo "   ✘ could not hide automatically — commit or rebuild, then: tools/images.sh safe-off"; fi
fi

# ── 2. counts ──────────────────────────────────────────────────────────────
t=$(git ls-tree -r --name-only HEAD 2>/dev/null \
    | grep -Eic '^posts/.*\.(png|jpe?g|webp)$')
d=$(find posts -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \
     -o -iname '*.webp' \) 2>/dev/null | wc -l | tr -d ' ')
echo "   images: $d on disk · $((t - d)) hidden · $t tracked"

# ── 3. remote sync (report only — never reset, that could discard work) ─────
if git remote get-url origin >/dev/null 2>&1; then
  git fetch -q origin main 2>/dev/null
  if git rev-parse --verify origin/main >/dev/null 2>&1; then
    l=$(git rev-parse HEAD); r=$(git rev-parse origin/main)
    if [ "$l" = "$r" ]; then
      echo "   ✔ in sync with origin/main"
    elif git merge-base --is-ancestor HEAD origin/main 2>/dev/null; then
      echo "   ⚠️  $(git rev-list --count HEAD..origin/main) commit(s) behind — run: git pull --ff-only"
    else
      echo "   ⚠️  DIVERGED from origin/main — inspect before touching anything"
    fi
  fi
else
  echo "   ⚠️  no 'origin' remote — see AGENTS.md for the remote URL"
fi

# ── 4. untracked images: invisible to git while hiding is on ───────────────
u=$(git ls-files --others --exclude-standard 2>/dev/null \
    | grep -Eic '^posts/.*\.(png|jpe?g|webp)$')
[ "${u:-0}" != "0" ] && \
  echo "   ⚠️  $u image(s) on disk are UNTRACKED — run tools/images.sh on before committing"

# ── 5. working tree ────────────────────────────────────────────────────────
c=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
if [ "$c" = "0" ]; then echo "   ✔ working tree clean"
else echo "   · $c local change(s)"; fi
echo
