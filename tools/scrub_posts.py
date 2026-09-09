#!/usr/bin/env python3
"""Scrub post text blocks to house style (owner rules, 2026-09-09):

  1. NO em/en dashes in post text (looks AI-written). Existing lines have a curated map;
     unknown " — " occurrences become ", ".
  2. NO hashtags. (#AndWords removed; Rust `#![]` code preserved.)
  3. ALWAYS mention @utexocom AND @utexoasia. ($USDT cashtag is fine.)

Idempotent. Run after writing/editing any posts:  python3 tools/scrub_posts.py
Prints char counts per post (singles should be <= 280; thread tweets too).
"""
import glob
import re

DASH_MAP = {
    "no rebalancing — Utexo handles it.": "no rebalancing. Utexo handles it.",
    "@utexocom — there are 3 real SDKs": "@utexocom: there are 3 real SDKs",
    "@UTEXO-Protocol/rgb-sdk (Node.js) — server wallets":
        "@UTEXO-Protocol/rgb-sdk (Node.js): server wallets",
    "@UTEXO-Protocol/rgb-sdk-web (Browser) — WASM LDK node runs FULLY IN BROWSER TAB, ESM only":
        "@UTEXO-Protocol/rgb-sdk-web (Browser): WASM LDK node runs FULLY IN BROWSER TAB, ESM only",
    "@UTEXO-Protocol/rgb-sdk-rn (React Native) — iOS/Android mobile RGB + Lightning":
        "@UTEXO-Protocol/rgb-sdk-rn (React Native): iOS/Android mobile RGB + Lightning",
    "@betfury_gaming — 3.5M users, $11.5B bets — rolling out":
        "@betfury_gaming: 3.5M users, $11.5B bets, rolling out",
    "Renat Skitsan — JV:": "Renat Skitsan. JV:",
    "x402 Foundation — operational launch": "x402 Foundation, operational launch",
    "contributed by Coinbase — lets AI agents": "contributed by Coinbase. It lets AI agents",
    "RGB-specific — it anchors": "RGB-specific: it anchors",
    "accountXpubVanilla — your BTC face.": "accountXpubVanilla: your BTC face.",
    "accountXpubColored — your RGB face.": "accountXpubColored: your RGB face.",
    "prepares them first — after you fund vanilla.": "prepares them first, after you fund vanilla.",
    "createBackup() — encrypted local file, offline.": "createBackup(): encrypted local file, offline.",
    "vssBackup() — Verifiable Secret Sharing to a VSS server.":
        "vssBackup(): Verifiable Secret Sharing to a VSS server.",
    "createLightningInvoice() — a standard BOLT11.": "createLightningInvoice(): a standard BOLT11.",
    "settles it — one call, or": "settles it: one call, or",
    "createRgbInvoice({ assetId, amount }) — a Lightning invoice":
        "createRgbInvoice({ assetId, amount }): a Lightning invoice",
    "HODL invoice — pays in, but": "HODL invoice: pays in, but",
    "Lightning Address — with LSP configured": "Lightning Address: with LSP configured",
    "settled — confirmed, final": "settled: confirmed, final",
    "future — expected after pending confirms": "future: expected after pending confirms",
    "spendable — usable right now": "spendable: usable right now",
    "A native RGB asset — an NIA:": "A native RGB asset, an NIA:",
    "side chain — an asset with": "side chain. It's an asset with",
    "issuance, transfer, destruction — cryptographically": "issuance, transfer, destruction: cryptographically",
    "Routing, channels, HTLCs — always online, always exposed.":
        "Routing, channels, HTLCs. Always online, always exposed.",
    "no lone key ever signs — a threshold": "no lone key ever signs: a threshold",
    "The contract stores it — and rejects": "The contract stores it and rejects",
    "• Blinded — receiver hidden": "• Blinded: receiver hidden",
    "• Witness — transfer bound": "• Witness: transfer bound",
    "onchainReceive({ witness: false }) — you pick.": "onchainReceive({ witness: false }). You pick.",
    "never touches the node — it stays in YOUR secret manager.":
        "never touches the node. It stays in YOUR secret manager.",
}

HASHTAG = re.compile(r"(?<![\w&])#[A-Za-z0-9_]+\S*")   # does NOT match #![...] (Rust)


def scrub(post):
    # 1. dashes: curated map first, generic fallback
    for a, b in DASH_MAP.items():
        post = post.replace(a, b)
    post = re.sub(r"\s+[—–]\s+", ", ", post)
    # 2. hashtags
    post = HASHTAG.sub("", post)
    post = re.sub(r"\n{3,}", "\n\n", post)
    post = re.sub(r"[ \t]+\n", "\n", post)
    post = post.strip()
    # 3. handles: ensure @utexocom + @utexoasia present
    if "@utexocom" not in post:
        post = post.rstrip() + "\n" + ("@utexocom @utexoasia" if "$USDT" in post else "@utexocom @utexoasia $USDT")
    if "@utexoasia" not in post and "@utexocom" in post:
        lines = post.split("\n")
        idx = max(i for i, l in enumerate(lines) if "@utexocom" in l)
        tail = HASHTAG.sub("", lines[idx]).replace("@utexocom", "").strip(" :.,-")
        if len(tail) <= 12:                      # sign-off style line -> extend inline
            lines[idx] = lines[idx].replace("@utexocom", "@utexocom @utexoasia", 1)
            post = "\n".join(lines)
        else:                                    # mid-sentence -> dedicated sign-off
            suffix = "@utexocom @utexoasia" if "$USDT" in post else "@utexocom @utexoasia $USDT"
            post = post.rstrip() + "\n" + suffix
    # dedupe handles if both already there somehow
    post = post.replace("@utexoasia @utexoasia", "@utexoasia")
    return post


def main():
    for f in sorted(glob.glob("posts/week-*/day-*.md")):
        s = open(f, encoding="utf-8").read()
        m = re.search(r"```text\n(.*?)\n```", s, re.S)
        if not m:
            continue
        original = m.group(1)
        scrubbed = scrub(original)
        if scrubbed != original:
            s = s[:m.start(1)] + scrubbed + s[m.end(1):]
            open(f, "w", encoding="utf-8").write(s)
        # report: total length + longest paragraph (thread tweet)
        paras = [p for p in scrubbed.split("\n\n") if p.strip()]
        worst = max(len(p) for p in paras)
        flag = " ⚠️ >280" if worst > 280 else ""
        dash = " ⚠️ DASH!" if ("—" in scrubbed or "–" in scrubbed) else ""
        hash_ = " ⚠️ HASHTAG!" if HASHTAG.search(scrubbed) else ""
        asia = "" if "@utexoasia" in scrubbed else " ⚠️ no @utexoasia"
        print(f"{f.split('/')[-1][:34]:36} total={len(scrubbed):4}  longest tweet={worst:3}{flag}{dash}{hash_}{asia}")


if __name__ == "__main__":
    main()
