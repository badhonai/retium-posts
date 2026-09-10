#!/usr/bin/env bash
# tools/images.sh — keep post images out of the local working tree.
#
# WHY
#   Post images are by far the biggest thing in this repo, and they are only
#   needed for the few minutes a build spends embedding them into
#   app/src/data.json and site/index.html. Once embedded, the committed
#   data.json IS the image archive — build_dashboard.py reuses that base64 when
#   the .png is not on disk, so hiding the loose files costs nothing.
#
# HOW
#   git sparse-checkout (non-cone mode), so git knows the images are absent by
#   design and never reports them as deleted. `git status` stays clean and a
#   stray `git add -A` can never wipe them from the repo.
#
# USAGE
#   tools/images.sh status        what is on disk, what is hidden
#   tools/images.sh off           hide every image  (the default state)
#   tools/images.sh on            materialise every image (before generating/new
#                                week's images, or before committing them)
#   tools/images.sh week NN       materialise only week NN's images
#
# Nothing here touches the remote. Images live in git as usual; this only
# controls whether they are materialised locally.

set -euo pipefail
cd "$(dirname "$0")/.."

SC=".git/info/sparse-checkout"
IMG_PATTERNS='!posts/**/*.png
!posts/**/*.jpg
!posts/**/*.jpeg
!posts/**/*.webp'

# images tracked by git in HEAD
tracked() { git ls-tree -r --name-only HEAD | grep -Ei '^posts/.*\.(png|jpe?g|webp)$' || true; }
# images physically present
on_disk() { find posts -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) 2>/dev/null || true; }

apply() {   # apply() <patterns...>
  git config core.sparseCheckout true
  git config core.sparseCheckoutCone false
  mkdir -p "$(dirname "$SC")"
  printf '%s\n' "$@" > "$SC"
  # A restored snapshot can leave stale stat info in the index, and read-tree
  # then refuses to remove files ("not uptodate"). Refresh first; it exits
  # non-zero when it actually updated something, which is not an error here.
  git update-index -q --refresh || true
  git read-tree -mu HEAD
}

cmd=${1:-status}

case "$cmd" in
  status)
    t=$(tracked | wc -l | tr -d ' ')
    d=$(on_disk | wc -l | tr -d ' ')
    echo "images tracked in HEAD : $t"
    echo "images on disk         : $d"
    echo "hidden (not local)     : $((t - d))"
    if git config --get core.sparseCheckout >/dev/null 2>&1; then
      echo "sparse-checkout        : ON"
    else
      echo "sparse-checkout        : off (all images materialised)"
    fi
    echo
    echo "Committed copies are always safe — build_dashboard.py reuses the base64"
    echo "already in app/src/data.json, so a rebuild never drops an image."
    ;;

  off)
    apply '/*' $IMG_PATTERNS
    echo "hidden. on disk now: $(on_disk | wc -l | tr -d ' ') / $(tracked | wc -l | tr -d ' ')"
    ;;

  on)
    apply '/*'
    echo "materialised: $(on_disk | wc -l | tr -d ' ') / $(tracked | wc -l | tr -d ' ')"
    ;;

  week)
    wk=${2:?usage: tools/images.sh week NN}
    wk=$(printf '%02d' "${wk#0}")
    apply '/*' $IMG_PATTERNS \
      "posts/week-$wk/*.png" "posts/week-$wk/*.jpg" \
      "posts/week-$wk/*.jpeg" "posts/week-$wk/*.webp"
    echo "week $wk materialised. on disk: $(on_disk | wc -l | tr -d ' ') / $(tracked | wc -l | tr -d ' ')"
    ;;

  *)
    echo "usage: tools/images.sh {status|off|on|week NN}" >&2
    exit 1
    ;;
esac
