#!/usr/bin/env python3
"""Retium post linter — enforces the scoring rules in PROMPTS.md.

    python3 tools/retium_lint.py              # lint everything
    python3 tools/retium_lint.py --audit      # also report legacy weeks

Rules enforced (source: MASTER_PROMPT_retium_scoring_guide.md):
  * no term from the 🔴 NEVER USE list (each costs 2-4 accuracy points)
  * no 🟡 use-with-caution term in its unsafe form
  * character budget: 2,000-3,500 for timeline / X Community posts
                      (replies and comments are naturally shorter - warned only)
  * @RetiumChain tagged
  * a CTA (wallet.retium.org or onboarding.retium.org) where the type allows
  * structure: hook, 3-5 bold section headers, synthesis, CTA

Weeks 1-3 are GRANDFATHERED: they were written before the banned list existed and
are already published. They are reported for information only (--audit) and are
never rewritten. They still serve as the no-repeat topic record.
"""
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "posts")
GRANDFATHERED = {1, 2, 3}

# ---------------------------------------------------------------- term lists
# 🔴 NEVER USE - each one costs 2-4 accuracy points when it appears
BANNED = [
    (r"RouterHelper", "RouterHelper"),
    (r"BLAKE3", "BLAKE3"),
    (r"3\s*/\s*5\s*quorum", "3/5 quorum"),
    (r"3[- ]out[- ]of[- ]5", "3-out-of-5"),
    (r"Ed25519", "Ed25519"),
    (r"\bRVM\b", "RVM"),
    (r"Wasmtime", "Wasmtime"),
    (r"100\s*[Mm]\s*(instruction\s*)?fuel", "100M fuel limit"),
    (r"100\s+million\s+instruction", "100M fuel limit"),
    (r"\bRCP-?1\b", "RCP-1"),
    (r"RotationLog", "RotationLog"),
    (r"Hard\s+Peer\s+Cap", "Hard Peer Cap"),
    (r"200\s+peer\s+connections", "200 peer connections"),
    (r"Three[- ]Point\s+Hello", "Three-Point Hello Handshake"),
    (r"~\s*10\s*MB", "10 MB validator application"),
    (r"6[- ]step\s+(GUI\s+)?wizard", "6-step wizard"),
    (r"230-410\s*MB|180-200\s*MB", "specific RAM telemetry"),
    (r"20-30%\s*CPU|~\s*9%\s*CPU", "specific CPU telemetry"),
    (r"Protocol Version \+ Genesis Hash", "handshake details"),
    (r"batch\s+mint\w*\s+100\s+NFT|100\s+NFTs?\s+in a single", "batch minting 100 NFTs"),
    (r"native\s+primitives?", "native primitives"),
    (r"host\s+functions?", "host functions"),
]

# 🟡 use with caution - fine in the safe form, penalised in the specific form
CAUTION = [
    (r"3\s*[-–]\s*20\s+(parallel\s+)?(open\s+)?blocks", "3-20 blocks -> say 'multiple blocks process simultaneously'"),
    (r"\bSoftFinal\b", "SoftFinal -> say 'instant finality' or 'immediate confirmation'"),
    (r"1%\s+fee\s+burn", "1% fee burn -> say 'a portion of fees is permanently burned'"),
    (r"interoperab", "interoperability -> say 'Unified Contract Layer'"),
]

LONG_FORM = ("Personal Timeline Post", "Retium X Community Post")
# Types that are posted on our own surface: they must carry the tag and a CTA.
# Comments and external replies hang off someone else's post, so a bare-link CTA
# would look spammy and the tag is redundant.
NEEDS_CTA = LONG_FORM + ("Additional Post #1 (Bonus)", "Additional Post #2 (Bonus)")
NEEDS_TAG = NEEDS_CTA + ("Retium Repost + Comment",)


def parse(path):
    txt = open(path, encoding="utf-8").read()
    m = re.search(r"^> \*\*Week (\d+)\*\* · Day (\d+) · (.+)$", txt, re.M)
    if not m:
        return None
    week, day, rest = int(m.group(1)), int(m.group(2)), m.group(3)
    fields = [f.strip() for f in rest.split("·")]
    post = re.search(r"```text\n(.*?)\n```", txt, re.S)
    return dict(
        week=week, day=day, path=path,
        ptype=fields[0] if fields else "?",
        req=fields[1] if len(fields) > 1 else "?",
        post=post.group(1) if post else "",
        scored=re.search(r"^- Base: ([\d.]+)", txt, re.M) is not None,
    )


def lint(p, audit=False):
    out = []
    body = p["post"]
    n = len(body)
    legacy = p["week"] in GRANDFATHERED
    tag = "legacy" if legacy else "NEW"

    for rx, name in BANNED:
        for _ in re.finditer(rx, body, re.I):
            out.append(f"  {'·' if legacy else '✗'} [{tag}] banned term: {name}")
    for rx, name in CAUTION:
        if re.search(rx, body, re.I):
            out.append(f"  {'·' if legacy else '✗'} [{tag}] caution: {name}")

    if n == 0:
        out.append("  ✗ no post text found")
        return out
    if p["ptype"] in LONG_FORM:
        if n < 2000:
            out.append(f"  ✗ {n:,} chars — long-form target is 2,000-3,500")
        elif n > 3500:
            out.append(f"  ✗ {n:,} chars — over the 3,500 cap")
    elif n < 400:
        out.append(f"  ✗ {n:,} chars — very short even for a {p['ptype']}")

    if p["ptype"] in NEEDS_TAG and "@RetiumChain" not in body:
        out.append("  ✗ missing @RetiumChain tag")
    if p["ptype"] in NEEDS_CTA and not re.search(r"(wallet|onboarding)\.retium\.org", body):
        out.append("  ✗ no CTA link (wallet.retium.org / onboarding.retium.org)")

    # structure: numbered section headers (𝟭. / 1. / SECTION 1) plus "→" bullets
    headers = re.findall(r"^[𝟬-𝟵\d]{1,2}[.．)]\s|^\s*→\s", body, re.M)
    if p["ptype"] in LONG_FORM and len(headers) < 3:
        out.append(f"  ✗ only {len(headers)} section/bullet markers — template wants 3-5 sections")

    return out


def main():
    audit = "--audit" in sys.argv
    paths = sorted(glob.glob(os.path.join(POSTS, "week-*", "day-*.md")))
    total = legacy_hits = new_hits = 0
    for path in paths:
        p = parse(path)
        if not p:
            print(f"?? cannot parse {path}")
            continue
        total += 1
        msgs = lint(p)
        if not msgs:
            continue
        if not audit and p["week"] in GRANDFATHERED:
            continue
        print(f"day {p['day']:>2} · w{p['week']} · {p['ptype']} · {os.path.basename(path)}")
        for m in msgs:
            print(m)
        if p["week"] in GRANDFATHERED:
            legacy_hits += 1
        else:
            new_hits += 1
    print(f"\n{total} posts scanned.")
    if audit:
        print(f"{legacy_hits} legacy posts carry banned/caution terms "
              f"(grandfathered, already published — never rewritten, never reused).")
    print(f"{new_hits} new posts have findings.")
    return 1 if new_hits else 0


if __name__ == "__main__":
    sys.exit(main())
