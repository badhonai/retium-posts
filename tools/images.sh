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
# USAGE  (in normal work you never type any of this — the build calls it)
#   tools/images.sh status     what is on disk, what is hidden
#   tools/images.sh safe-off   hide, but ONLY if nothing can be lost  <-- default
#   tools/images.sh off        hide unconditionally (rarely what you want)
#   tools/images.sh on         materialise every image
#   tools/images.sh week NN    materialise only week NN's images
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
# images on disk that git cannot see (the "would silently miss the commit" case)
untracked() { git ls-files --others --exclude-standard 2>/dev/null | grep -Ei '^posts/.*\.(png|jpe?g|webp)$' || true; }
# images newer than data.json (the last build may not have embedded them yet)
newer_than_data() { find posts -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) -newer app/src/data.json 2>/dev/null || true; }

# ⚠️  SAFETY GATE — do not remove this.
# `git read-tree -mu HEAD` is the only way to apply sparse patterns, and it is
# a *merge* against HEAD: if anything is STAGED, it resolves those paths back to
# HEAD and silently reverts real work. Verified the hard way — it once wiped an
# uncommitted build_dashboard.py. So we refuse to run with a dirty index. The
# build never stages anything, so this never fires in normal use.
require_clean_index() {
  if ! git diff --cached --quiet 2>/dev/null; then
    echo "images.sh: REFUSED — the index has STAGED changes." >&2
    echo "           git read-tree would merge HEAD over them and revert that work." >&2
    echo "           Commit them, or 'git reset', then re-run." >&2
    exit 1
  fi
}

apply() {   # apply() <patterns...>
  require_clean_index
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

  safe-off)
    # Hide ONLY when nothing can be lost:
    #   - no image is untracked (an untracked one could never reach git)
    #   - no image is newer than data.json (older = already embedded)
    # This is what build_dashboard.py and doctor.sh call, so staying light is
    # automatic rather than something you have to remember.
    u=$(untracked | wc -l | tr -d ' ')
    n=$(newer_than_data | wc -l | tr -d ' ')
    if [ "$u" != "0" ] || [ "$n" != "0" ]; then
      echo "$u untracked / $n newer than data.json"
      exit 1
    fi
    apply '/*' $IMG_PATTERNS
    echo "hidden safely: $(on_disk | wc -l | tr -d ' ') on disk / $(tracked | wc -l | tr -d ' ') tracked"
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
    echo "usage: tools/images.sh {status|safe-off|off|on|week NN}" >&2
    exit 1
    ;;
esac
