#!/usr/bin/env python3
"""Build the retium.posts React app -> site/index.html (single file, Vercel-ready).

Steps:
  1. parse posts/week-*/day-*.md  ->  app/src/data.json  (posts + images + lock SHA)
  2. `npm run build` in app/  (run `npm install` inside app/ first if node_modules missing)
  3. inline the built JS/CSS into one site/index.html

The lock password hash lives here (SHA-256 of the password). Change password:
    printf '%s' 'newpassword' | sha256sum   ->  paste below -> rebuild
"""
import base64
import glob
import io
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "posts")
APP = os.path.join(ROOT, "app")
SITE = os.path.join(ROOT, "site")
LOCK_SHA = "e81dfe69841ad2f7b5790b63e998f0febaf3b29acd732881975130761b98e2c7"  # sha256("king")
LOCK_FNV = "da13e3d6"  # fnv1a fallback for non-secure contexts; set via tools/set_password.py

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Pillow required:  pip install Pillow")


def parse_day(path, week):
    txt = open(path, encoding="utf-8").read()
    day = int(re.search(r"^# Day (\d+)", txt, re.M).group(1))
    title = re.search(r"^# Day \d+ · (.+)$", txt, re.M).group(1).strip()

    # "> **Week 1** · Day 1 · Personal Timeline Post · Required #4 · Aug 10 2026 · 1,909 chars · ..."
    m = re.search(r"^> \*\*Week \d+\*\* · Day \d+ · (.+)$", txt, re.M)
    fields = [f.strip() for f in m.group(1).split("·")] if m else []
    ptype = fields[0] if fields else "Single post"
    req = fields[1] if len(fields) > 1 else ""
    date = fields[2] if len(fields) > 2 else ""

    post = re.search(r"```text\n(.*?)\n```", txt, re.S).group(1).strip()
    vis = re.search(r"## 🎨 Visual notes\n\n(.*?)(?=\n## |\Z)", txt, re.S)
    facts = re.search(r"## ✅ Facts & sources\n\n(.*?)(?=\n## |\Z)", txt, re.S)

    # 🏆 Score block -> the points the scorer returned, recorded in the repo file.
    # One number per post. The five-category breakdown is kept in the file as a
    # reference note only - the app never asks for it.
    ms = re.search(r"^- Score: ([\d.]+)\s*$", txt, re.M)
    seed = float(ms.group(1)) if ms else None

    base = os.path.splitext(path)[0]
    img = None
    for ext in (".png", ".jpg", ".jpeg"):
        if os.path.exists(base + ext):
            img = base + ext
            break
    imgfile = os.path.basename(img) if img else os.path.basename(base) + ".png"
    fname = os.path.basename(path)
    slug = re.sub(r"^day-\d+-|\.md$", "", fname)
    return dict(day=day, week=week, title=title, fmt=ptype, ptype=ptype, req=req,
                date=date, slug=slug, id=f"w{week}-d{day:02d}-{slug}", post=post,
                visual=vis.group(1).strip() if vis else "",
                facts=facts.group(1).strip()[:600] if facts else "",
                file=fname, imgfile=imgfile, imgpath=img, seed=seed)


def data_uri(path, max_w, q):
    im = Image.open(path).convert("RGB")
    if im.width > max_w:
        im = im.resize((max_w, int(im.height * max_w / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=q, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def _imgkey(e):
    """Stable key for a post across rebuilds.

    Retium carries an explicit `id`; the other repos identify a post by
    week + filename. Either way the key survives an image going off disk.
    """
    return e.get("id") or "%s-%s" % (e.get("week"), e.get("file"))


def prev_images():
    """Images already baked into app/src/data.json, keyed by post id.

    Post images are deliberately not kept on disk (see tools/images.sh) — they are
    the single biggest thing in this repo. They are only needed while a build is
    embedding them, and the embedded copies already live in the committed
    data.json / site/index.html. So when a .png is absent locally we reuse the
    base64 that is already committed instead of silently dropping the image.
    """
    p = os.path.join(APP, "src", "data.json")
    if not os.path.exists(p):
        return {}
    try:
        old = json.load(open(p, encoding="utf-8"))
    except Exception:
        return {}
    return {_imgkey(e): (e.get("img"), e.get("thumb"), e.get("imgfile"))
            for e in old.get("data", []) if e.get("img")}


def write_data_json():
    entries = []
    prev = prev_images()
    reused = []
    for wk_dir in sorted(glob.glob(os.path.join(POSTS, "week-*"))):
        week = int(re.search(r"week-(\d+)", wk_dir).group(1))
        for path in sorted(glob.glob(os.path.join(wk_dir, "day-*.md"))):
            e = parse_day(path, week)
            if e["imgpath"]:
                e["img"] = data_uri(e["imgpath"], 1600, 85)
                e["thumb"] = data_uri(e["imgpath"], 320, 72)
            else:
                # Not on disk. Reuse the copy already committed in data.json so a
                # rebuild never strips an image that is already published.
                old = prev.get(_imgkey(e))
                if old:
                    e["img"], e["thumb"] = old[0], old[1]
                    # keep the real extension (.jpg posts would otherwise
                    # be renamed .png just because the file is not local)
                    if old[2]:
                        e["imgfile"] = old[2]
                    reused.append(_imgkey(e))
                else:
                    e["img"] = None
                    e["thumb"] = None
            e.pop("imgpath")
            entries.append(e)
    if reused:
        print(f"images: {len(reused)} reused from committed data.json "
              f"(not on disk — see tools/images.sh)")
    entries.sort(key=lambda d: d["day"])
    os.makedirs(os.path.join(APP, "src"), exist_ok=True)
    with open(os.path.join(APP, "src", "data.json"), "w", encoding="utf-8") as f:
        json.dump({"data": entries, "sha": LOCK_SHA, "fnv": LOCK_FNV, "built": __import__("time").strftime("%Y-%m-%d")}, f,
                  ensure_ascii=False)
    return entries


def build_and_inline():
    node_modules = os.path.join(APP, "node_modules")
    if not os.path.isdir(node_modules):
        print("app/node_modules missing — running npm install (first time only)…")
        subprocess.run(["npm", "install", "--no-audit", "--no-fund"], cwd=APP, check=True)
    subprocess.run(["npm", "run", "build"], cwd=APP, check=True)

    dist = os.path.join(APP, "dist")
    html = open(os.path.join(dist, "index.html"), encoding="utf-8").read()

    def js_inline(m):
        src = open(os.path.join(dist, m.group(1).lstrip("./")), encoding="utf-8").read()
        src = re.sub(r"</script", r"<\\/script", src, flags=re.I)
        is_module = bool(re.search(r"^\s*(import|export)\b", src, re.M))
        attr = ' type="module"' if is_module else ""
        return "<script" + attr + ">" + src + "</script>"

    def css_inline(m):
        src = open(os.path.join(dist, m.group(1).lstrip("./")), encoding="utf-8").read()
        return "<style>" + src + "</style>"

    # CSS: inline in place (head)
    html = re.sub(r"<link rel=\"stylesheet\"[^>]*href=\"(\./assets/[^\"]+\.css)\"[^>]*>",
                  css_inline, html)
    # JS: extract, remove vite's inline modulepreload polyfill, append bundle at end of <body>
    js_tags = re.findall(r"<script type=\"module\"[^>]*src=\"(\./assets/[^\"]+\.js)\"[^>]*></script>", html)
    html = re.sub(r"<script type=\"module\">[^<]*</script>", "", html)          # preload polyfill
    html = re.sub(r"<script type=\"module\"[^>]*src=\"(\./assets/[^\"]+\.js)\"[^>]*></script>", "", html)
    bundle = ""
    for j in js_tags:
        class _M:  # minimal match-like object for js_inline
            def group(self, i): return j
        bundle += js_inline(_M())
    html = html.replace("</body>", bundle + "\n</body>")

    os.makedirs(SITE, exist_ok=True)
    out = os.path.join(SITE, "index.html")
    open(out, "w", encoding="utf-8").write(html)
    ok = ("<script type=\"module\" src" not in html) and ("href=\"./assets/" not in html)
    print(f"site/index.html: {os.path.getsize(out)//1024} KB, fully inlined: {ok}")


def main():
    entries = write_data_json()
    scored = [e for e in entries if e["seed"] is not None]
    pts = sum(e["seed"] for e in scored)
    print(f"data.json: {len(entries)} posts, {sum(1 for e in entries if e['img'])} images")
    print(f"seed scores: {len(scored)} posts scored, {pts:g} points on record")
    build_and_inline()


if __name__ == "__main__":
    main()
