#!/usr/bin/env bash
# tools/images.sh — keep post images out of the local working tree.
#
# WHY
#   Post images are the biggest thing in these repos, and they are only needed
#   while a build embeds them into app/src/data.json and site/index.html. After
#   that the committed data.json holds every image, and build_dashboard.py
#   reuses it — so the loose .png files are safe to keep off disk.
#
# HOW
#   git sparse-checkout. Git knows the images are absent by design, so
#   `git status` stays clean and `git add -A` can never delete them for real.
#
# USAGE
#   tools/images.sh status   what is on disk, what is hidden
#   tools/images.sh on       bring every image back  (do this BEFORE making images)
#   tools/images.sh off      hide every image again  (do this AFTER committing)
#   tools/images.sh week NN  bring back just week NN
#
# Two rules: `on` before generating a week's images, `off` after committing them.
# That is all. Nothing here touches the remote.

set -euo pipefail
cd "$(dirname "$0")/.."

SC=".git/info/sparse-checkout"

tracked() { git ls-tree -r --name-only HEAD | grep -Ei '^posts/.*\.(png|jpe?g|webp)$' || true; }
on_disk() { find posts -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) 2>/dev/null || true; }

# SAFETY GATE — do not remove.
# git read-tree -mu HEAD is a merge against HEAD: if anything is STAGED it
# resolves those paths back to HEAD and silently reverts the work. It destroyed
# an uncommitted file during development, so we refuse to run with a dirty index.
require_clean_index() {
  if ! git diff --cached --quiet 2>/dev/null; then
    echo "images.sh: refused — you have STAGED changes." >&2
    echo "           Commit them, or 'git reset', then re-run." >&2
    exit 1
  fi
}

apply() {
  require_clean_index
  git config core.sparseCheckout true
  git config core.sparseCheckoutCone false
  mkdir -p "$(dirname "$SC")"
  printf '%s\n' "$@" > "$SC"
  git update-index -q --refresh || true   # stale stat info after a snapshot restore
  git read-tree -mu HEAD
}

case "${1:-status}" in
  status)
    t=$(tracked | wc -l | tr -d ' ')
    d=$(on_disk | wc -l | tr -d ' ')
    echo "images tracked : $t"
    echo "on disk        : $d"
    echo "hidden         : $((t - d))"
    ;;
  on)   apply '/*'; echo "materialised $(on_disk | wc -l | tr -d ' ') of $(tracked | wc -l | tr -d ' ')" ;;
  off)
    apply '/*' '!posts/**/*.png' '!posts/**/*.jpg' '!posts/**/*.jpeg' '!posts/**/*.webp'
    echo "hidden — $(on_disk | wc -l | tr -d ' ') on disk of $(tracked | wc -l | tr -d ' ')"
    ;;
  week)
    wk=$(printf '%02d' "${2#0}")
    apply '/*' '!posts/**/*.png' '!posts/**/*.jpg' '!posts/**/*.jpeg' '!posts/**/*.webp' \
          "posts/week-$wk/*.png" "posts/week-$wk/*.jpg" \
          "posts/week-$wk/*.jpeg" "posts/week-$wk/*.webp"
    echo "week $wk back — $(on_disk | wc -l | tr -d ' ') on disk"
    ;;
  *) echo "usage: tools/images.sh {status|on|off|week NN}" >&2; exit 1 ;;
esac
