#!/usr/bin/env python3
"""One-time importer: turn the three legacy RTM week files into posts/week-NN/day-NN-slug.md.

Kept in the repo for provenance — it documents exactly how weeks 1-3 were created.

    python3 tools/import_legacy_posts.py --preview   # print what would be built
    python3 tools/import_legacy_posts.py             # write the files

Text is copied VERBATIM. Nothing is rewritten, reworded or "corrected" — these
posts are already published, and the owner's wording is the record of what was
actually posted.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = "/home/user/uploads"

# ---------------------------------------------------------------- metadata
# day, week, date, post type, requirement, title, slug, goal, (base, acc, orig, eng, cons)
META = [
 # ---------------- WEEK 1 (Aug 10-16, 2026) ----------------
 (1, 1, "Aug 10", "Personal Timeline Post", "Required #4",
  "Why Forks Are Mathematically Impossible on Retium", "why-forks-are-impossible",
  "Show that no-fork behaviour is a consequence of PNLA, not an added feature.",
  (30, 26, 15, 0, 14)),
 (2, 1, "Aug 11", "External Engagement Reply", "Required #2",
  "Reply to an L1 scalability discussion: parallel blocks", "external-reply-parallel-blocks",
  "Enter an external gas/scalability thread and offer Retium's parallel model.",
  (30, 22, 13, 0, 15)),
 (3, 1, "Aug 12", "Retium Repost + Comment", "Required #1",
  "Repost @RetiumChain PNLA post + Rust developer commentary", "rust-from-scratch-repost",
  "Add a Rust builder's argument for why from-scratch matters.",
  (30, 20, 13, 1.09, 15)),
 (4, 1, "Aug 13", "Retium X Community Post", "Required #3",
  "A Developer's Guide to Retium's Fee Model ($0.01 to $0.45)", "fee-model-developer-guide",
  "Publish the full weight-based fee table as a reference the community can save.",
  (30, 21, 12, 2.84, 15)),
 (5, 1, "Aug 14", "Comment on Retium Post", "Required #5",
  "Comment on @RetiumChain Safehouse/tokenomics post", "safehouse-comment",
  "Land a sharp developer take on the Safehouse under an official post.",
  None),
 (6, 1, "Aug 15", "Additional Post #1 (Bonus)", "Bonus",
  "WASM Smart Contracts + Unified Contract Layer", "wasm-unified-contract-layer",
  "Compare contract models across Ethereum/Solana/Cosmos and Retium.",
  (30, 22, 13, 2.54, 15)),
 (7, 1, "Aug 16", "Additional Post #2 (Bonus)", "Bonus",
  "No Team Allocation, No Insiders: The Safehouse Explained", "safehouse-no-insiders",
  "Frame the zero-allocation launch as the anti-crypto token sale.",
  None),
 # ---------------- WEEK 2 (Aug 18-24, 2026) ----------------
 (8, 2, "Aug 18", "Personal Timeline Post", "Required #4",
  "Retium's NFT Launchpad Just Went Live: Why RCP-1 Changes Everything", "nft-launchpad-rcp1",
  "Explain RCP-1 as protocol-native rather than contract-level.",
  None),
 (9, 2, "Aug 19", "External Engagement Reply", "Required #2",
  "Reply to NFT/gaming account: RCP-1 vs ERC-721", "external-reply-rcp1",
  "Enter an NFT infrastructure thread with the RCP-1 alternative.",
  None),
 (10, 2, "Aug 20", "Retium Repost + Comment", "Required #1",
  "Repost @RetiumChain NFT Launchpad + dev commentary", "launchpad-repost",
  "Treat the Launchpad as a live stress test of the architecture.",
  None),
 (11, 2, "Aug 21", "Retium X Community Post", "Required #3",
  "The Retium Execution Pipeline: From Router to HardFinal", "execution-pipeline-router-hardfinal",
  "Write the end-to-end routing-to-finality reference.",
  None),
 (12, 2, "Aug 22", "Comment on Retium Post", "Required #5",
  "Comment on validator node wizard post", "validator-wizard-comment",
  "Argue that validator accessibility is a security property.",
  None),
 (13, 2, "Aug 23", "Additional Post #1 (Bonus)", "Bonus",
  "Why Retium's Validator Rotation Eliminates Cartels", "validator-rotation-game-theory",
  "Game-theory breakdown of rotation vs cartel formation.",
  None),
 (14, 2, "Aug 24", "Additional Post #2 (Bonus)", "Bonus",
  "The Safehouse: 1:1 rUSD Reserve Replaces the Token Allocation Model", "safehouse-1to1-rusd",
  "Full tokenomics breakdown built around the Safehouse.",
  None),
 # ---------------- WEEK 3 (Aug 25-31, 2026) ----------------
 (15, 3, "Aug 25", "Personal Timeline Post", "Required #4",
  "What the Retium Testnet Reset Actually Proved About PrimeMesh", "testnet-reset-primemesh",
  "Read the Aug 20 reset as a stress test rather than a failure.",
  (30, 28, 17, 0.14, 15)),
 (16, 3, "Aug 26", "External Engagement Reply", "Required #2",
  "Reply to blockchain security post: role separation", "security-role-separation-reply",
  "Enter a security thread with the tri-role attack-surface argument.",
  None),
 (17, 3, "Aug 27", "Retium Repost + Comment", "Required #1",
  "Repost @RetiumChain \"No mempool\" post + routing commentary", "no-mempool-repost",
  "Unpack what \"transactions go straight to the block\" actually means.",
  (30, 13, 15, 0.29, 15)),
 (18, 3, "Aug 28", "Retium X Community Post", "Required #3",
  "How Retium's Two Finality Tiers Solve Speed vs Certainty", "two-finality-tiers",
  "Compare instant confirmation and HardFinal against other L1s.",
  None),
 (19, 3, "Aug 29", "Comment on Retium Post", "Required #5",
  "Comment on PrimeMesh deterministic structure post", "primemesh-deterministic-comment",
  "Tie the official deterministic-structure post to the reset behaviour.",
  None),
 (20, 3, "Aug 30", "Additional Post #1 (Bonus)", "Bonus",
  "The Early Validator Round: Pricing That Inverts the L1 Playbook", "early-validator-round",
  "Analyse $100/$1,000 permanent seats as a decentralisation strategy.",
  None),
 (21, 3, "Aug 31", "Additional Post #2 (Bonus)", "Bonus",
  "Why Retium's Matchmaker Makes Validator Cartels Expensive", "matchmaker-cartels-game-theory",
  "Game-theory breakdown of predictability + persistence removal.",
  (30, 27, 17, 1.56, 15)),
]

# Day 17's 73.29 belongs to the ORIGINAL BLAKE3 version of that post. The file
# holds the corrected rewrite; the score is the one the scorer returned.
DAY17_NOTE = ("The 73.29 score was returned for the ORIGINAL version of this post "
              "(it used RouterHelper, BLAKE3, 3-20 blocks, 3/5 quorum, SoftFinal — "
              "all now on the banned list). The text below is the corrected rewrite, "
              "which has not been re-scored.")


# ---------------------------------------------------------------- extraction
def load(name):
    return open(os.path.join(SRC, name), encoding="utf-8").read().splitlines()


def extract_week1():
    """Week 1 keeps post text in '> ' blockquotes under a '### ... TEXT' marker."""
    lines = load("RTM_week1.md")
    out, i, cur = {}, 0, None
    while i < len(lines):
        ln = lines[i]
        if re.match(r"^## 📝 DAY (\d+)", ln):
            cur = int(re.match(r"^## 📝 DAY (\d+)", ln).group(1))
            out[cur] = []
        elif ln.startswith("### ") and " TEXT" in ln:
            # collect blockquote lines until the next ### marker
            j = i + 1
            while j < len(lines) and not lines[j].startswith("### "):
                if lines[j].startswith("> "):
                    out[cur].append(lines[j][2:])
                elif lines[j].strip() == ">":
                    out[cur].append("")
                j += 1
            i = j
            continue
        i += 1
    return {k: "\n".join(v).strip() for k, v in out.items()}


def extract_plain(fname):
    """Weeks 2/3 keep post text as plain paragraphs, in the last '---' block of
    each day section (earlier blocks are 'HOW TO USE THIS' instructions)."""
    lines = load(fname)
    starts = [(i, int(m.group(1))) for i, ln in enumerate(lines)
              if (m := re.match(r"^## 📝 DAY (\d+)", ln))]
    ends = [i for i, ln in enumerate(lines) if ln.startswith("## 📊")]
    end_all = ends[0] if ends else len(lines)
    out = {}
    for idx, (start, day) in enumerate(starts):
        stop = starts[idx + 1][0] if idx + 1 < len(starts) else end_all
        section = lines[start:stop]
        # split on '---' separator lines
        blocks, buf = [], []
        for ln in section[1:]:
            if ln.strip() == "---":
                if buf:
                    blocks.append(buf)
                buf = []
            else:
                buf.append(ln)
        if buf:
            blocks.append(buf)
        # drop instruction blocks and any block that is only whitespace,
        # then keep the last real content block
        blocks = [b for b in blocks
                  if b and "\n".join(b).strip()
                  and not b[0].startswith("**INSTRUCTIONS:**")
                  and not b[0].startswith("### ")]
        if not blocks:
            raise SystemExit(f"no content block found for day {day} in {fname}")
        out[day] = "\n".join(blocks[-1]).strip()
    return out


def extract_visuals_week1():
    """Week 1 has a '### 🎨 Visual Suggestion' block per day."""
    lines = load("RTM_week1.md")
    out, i, cur = {}, 0, None
    while i < len(lines):
        ln = lines[i]
        if re.match(r"^## 📝 DAY (\d+)", ln):
            cur = int(re.match(r"^## 📝 DAY (\d+)", ln).group(1))
        elif ln.startswith("### 🎨 Visual Suggestion"):
            j, buf = i + 1, []
            while j < len(lines) and not lines[j].startswith("## "):
                buf.append(lines[j])
                j += 1
            out[cur] = "\n".join(buf).strip()
            i = j
            continue
        i += 1
    return out


# ---------------------------------------------------------------- rendering
def render(meta, text, visual):
    day, week, date, ptype, req, title, slug, goal, score = meta
    n = len(text)
    head = (f"# Day {day} · {title.upper()}\n\n"
            f"> **Week {week}** · Day {day} · {ptype} · {req} · {date} 2026 · "
            f"{n:,} chars · X post for @RetiumChain\n\n"
            f"**Goal:** {goal}\n")
    body = f"\n## 📋 Post — copy & paste\n\n```text\n{text}\n```\n"
    vis = (f"\n## 🎨 Visual notes\n\n{visual}\n" if visual
           else "\n## 🎨 Visual notes\n\nNo visual was produced for this post (it is already "
                "published). If you ever re-run this topic, see `IMAGE_PROMPT.md`.\n")
    if score:
        b, a, o, e, c = score
        sc = (f"\n## 🏆 Score (actual, from the scorer)\n\n"
              f"- Base: {b}\n- Accuracy: {a}\n- Originality: {o}\n"
              f"- Engagement: {e}\n- Consistency: {c}\n")
    else:
        sc = ("\n## 🏆 Score\n\n- Not scored yet — fill this in when the scorer posts results.\n")
    if day == 17:
        sc += f"\n> ⚠️ {DAY17_NOTE}\n"
    status = (f"\n## 🚀 Status\n\n"
              f"- [x] Text ready · - [ ] Posted on X — *Day {day}, Week {week}*\n")
    return head + body + vis + sc + status


def main():
    preview = "--preview" in sys.argv
    w1 = extract_week1()
    w2 = extract_plain("RTM_week2.md")
    w3 = extract_plain("week3_corrected_posts.md")
    vis1 = extract_visuals_week1()
    texts = {1: w1, 2: w2, 3: w3}
    visuals = {1: vis1, 2: {}, 3: {}}

    for meta in META:
        day, week = meta[0], meta[1]
        text = texts[week].get(day % 7 if day % 7 else 7)
        if not text:
            raise SystemExit(f"missing text for day {day}")
        n = len(text)
        flag = "" if 2000 <= n <= 3500 else ("  ⚠️ outside 2000-3500" if n > 3500 else "  (short)")
        if preview:
            print(f"day {day:>2} w{week}  {n:>5} chars  {meta[6]}{flag}")
            print(f"          first: {text[:90]!r}")
        else:
            d = os.path.join(ROOT, "posts", f"week-{week:02d}")
            os.makedirs(d, exist_ok=True)
            path = os.path.join(d, f"day-{day:02d}-{meta[6]}.md")
            open(path, "w", encoding="utf-8").write(render(meta, text, visuals[week].get(day % 7 or 7)))
    if not preview:
        print(f"wrote {len(META)} posts into posts/week-01..03")


if __name__ == "__main__":
    main()
