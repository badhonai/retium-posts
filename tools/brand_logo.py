#!/usr/bin/env python3
"""Composite the OFFICIAL utexo logo onto a generated post image.

Why: image models drift when drawing logos. So the style prompt (IMAGE_PROMPT.md v1.1+)
generates the scene with an EMPTY top-left corner, and this script pastes the official
lockup (brand/utexo-logo-dark.png, recolored from uploads/utexo-logotype-white.png)
at the exact placement measured from the approved originals:

    left edge = 0.0567 * W
    logo height = 0.1257 * H   (v-center at 0.1866 * H)

Usage:
    python3 tools/brand_logo.py INPUT.png OUTPUT.png
"""
import sys
import os
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(ROOT, "brand", "utexo-logo-dark.png")

LEFT = 0.0567
HFRAC = 0.1257
VCENTER = 0.1866


def collision_check(src, W, H):
    """Warn if the logo target zone isn't empty cream background (v1.1 rule)."""
    x0, y0 = 0, 0
    x1 = round((LEFT + 0.42) * W)          # logo strip incl. wordmark reach
    y1 = round((VCENTER + HFRAC / 2 + 0.02) * H)
    zone = np.asarray(src.convert("L").crop((x0, y0, x1, y1)))
    dark = (zone < 150).mean()
    if dark > 0.02:
        print(f"  ⚠️ COLLISION RISK: {dark:.1%} dark pixels in logo zone "
              f"(should be <2%). Headline likely too high — regenerate the render.")
    else:
        print("  logo zone clean ✓")


def composite(src_path, dst_path):
    src = Image.open(src_path).convert("RGBA")
    W, H = src.size
    collision_check(src, W, H)
    logo = Image.open(LOGO).convert("RGBA")
    th = round(HFRAC * H)
    tw = round(logo.width * th / logo.height)
    logo = logo.resize((tw, th), Image.LANCZOS)
    if tw > logo.width * 1.2:  # sharpen only when noticeably upscaled
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
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    composite(sys.argv[1], sys.argv[2])
