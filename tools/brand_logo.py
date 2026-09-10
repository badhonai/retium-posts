#!/usr/bin/env python3
"""Composite the OFFICIAL Retium logo onto a generated post image.

Why: image models drift when drawing logos. So the render is generated with an
EMPTY top-left corner and this script pastes the official lockup there at a fixed
placement.

Retium specifics:
  * All four official logos are MONOCHROME. Pick the variant that matches the
    render background - the logo must never be recoloured.
        dark render  -> brand/retium-logo-horizontal-ondark.png  (light ink)
        light render -> brand/retium-logo-horizontal-onlight.png (dark ink)
  * The horizontal lockup is 573x106 (5.4:1) - wider than the Utexo mark, so it
    is sized by height and lands at roughly a third of the image width.

Placement (fractions of image size):
    left edge  = 0.050 * W
    logo height= 0.110 * H   (v-center at 0.155 * H)

Usage:
    python3 tools/brand_logo.py INPUT.png OUTPUT.png [--light]
"""
import sys
import os
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO_DARK = os.path.join(ROOT, "brand", "retium-logo-horizontal-ondark.png")
LOGO_LIGHT = os.path.join(ROOT, "brand", "retium-logo-horizontal-onlight.png")

LEFT = 0.050
HFRAC = 0.110
VCENTER = 0.155


def collision_check(src, W, H, light_bg=False):
    """The logo zone must be empty background so the lockup sits on clean space.

    Renders are dark by default, so "empty" means mostly dark pixels there.
    """
    x1 = round((LEFT + 0.40) * W)                    # logo strip incl. wordmark reach
    y1 = round((VCENTER + HFRAC / 2 + 0.02) * H)
    zone = np.asarray(src.convert("L").crop((0, 0, x1, y1)))
    if light_bg:
        off = (zone < 150).mean()                    # dark marks on a light field
        what = "dark"
    else:
        off = (zone > 150).mean()                    # light content on a dark field
        what = "bright"
    if off > 0.04:
        print(f"  ⚠️  COLLISION RISK: {off:.1%} {what} pixels in the logo zone "
              f"(want <4%). Move the artwork down or regenerate.")
    else:
        print("  logo zone clean ✓")


def composite(src_path, dst_path, light_bg=False):
    src = Image.open(src_path).convert("RGBA")
    W, H = src.size
    collision_check(src, W, H, light_bg)
    logo = Image.open(LOGO_LIGHT if light_bg else LOGO_DARK).convert("RGBA")
    th = round(HFRAC * H)
    tw = round(logo.width * th / logo.height)
    logo = logo.resize((tw, th), Image.LANCZOS)
    if tw > logo.width * 1.2:      # sharpen only when noticeably upscaled
        logo = logo.filter(ImageFilter.UnsharpMask(radius=1.6, percent=90, threshold=2))
    x = round(LEFT * W)
    y = round(VCENTER * H - th / 2)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer.paste(logo, (x, y), logo)
    out = Image.alpha_composite(src, layer)
    if dst_path.lower().endswith((".jpg", ".jpeg")):
        out.convert("RGB").save(dst_path, quality=95)
    else:
        out.convert("RGB").save(dst_path)
    print(f"{os.path.basename(dst_path)}: logo {tw}x{th} at ({x},{y})")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 2:
        raise SystemExit(__doc__)
    composite(args[0], args[1], light_bg="--light" in sys.argv)
