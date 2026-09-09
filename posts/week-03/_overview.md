# RETIUM WEEK 3 (Days 15–21) · Testnet Reset, Finality Tiers, and the Matchmaker
### August 25–31, 2026 · Voice: developer / technical

Imported from `week3_corrected_posts.md` on 2026-09-10 by `tools/import_legacy_posts.py`.

This week is the **corrected** set: it exists specifically to replace an earlier draft
that leaned on banned terms. It is the cleanest week in the repo and the best template
for new posts — zero banned terms, zero caution terms.

## Slate

| Day | Date | Type | Req | Topic | Score |
|-----|------|------|-----|-------|-------|
| 15 | Aug 25 | Personal Timeline Post | Required #4 | What the Testnet Reset Proved About PrimeMesh | **90.14** |
| 16 | Aug 26 | External Engagement Reply | Required #2 | Security thread → tri-role attack surface | not recorded |
| 17 | Aug 27 | Retium Repost + Comment | Required #1 | "No mempool" post → routing commentary | **73.29** ⚠️ |
| 18 | Aug 28 | Retium X Community Post | Required #3 | Two Finality Tiers: Speed vs Certainty | not recorded |
| 19 | Aug 29 | Comment on Retium Post | Required #5 | PrimeMesh deterministic structure | not recorded |
| 20 | Aug 30 | Additional Post #1 | Bonus | Early Validator Round pricing | not recorded |
| 21 | Aug 31 | Additional Post #2 | Bonus | Matchmaker Makes Cartels Expensive | **90.56** |

⚠️ **Day 17:** the 73.29 was returned for the **original** version of that post, which
used RouterHelper, BLAKE3, "3-20 blocks", "3/5 quorum" and SoftFinal. The text in this
repo is the corrected rewrite and has not been re-scored. Day 17 is the single clearest
proof of the rule: five unestablished terms turned a ~90 post into a 73.

All five required types are present, plus two bonus posts.

## 🔁 Consumed topics — DO NOT REPEAT

- Testnet reset as a stress test; halt-and-fix as the correct failure mode (day 15)
- Suits as state-synchronisation anchors during recovery (day 15)
- Tri-role separation as an attack-surface argument (day 16)
- Direct routing → no mempool → MEV dies at ingress (day 17)
- Two finality tiers; instant confirmation vs HardFinal vs Ethereum/Solana/Bitcoin (day 18)
- "If a block does not fit the PrimeMesh, it is rejected" (day 19)
- Early Validator Round: $100 / $1,000 permanent seats, 10× advantage (day 20)
- Matchmaker: deterministic-but-unpredictable assignment + continuous rotation (day 21)
- 90% Worker reward share as a decentralisation mechanism (days 20, 21)

## 🟢 Term audit: CLEAN

No banned terms. No caution terms. Week 3 is the reference for how a new post should
read.

---

# 🌱 WEEK 4 SEEDS

Topics from the master prompt's Part 6 that **have not been used yet**, checked against
every topic consumed in weeks 1–3:

1. **Fee model enables micro-transactions impossible on Ethereum** — what a $0.01
   transaction unlocks that $5+ gas does not. Terms: weight-based fees, $0.01, oracle
   rate, no gas auctions.
2. **$Pie is more honest than liquid staking tokens** — receipt vs reward, compared with
   Lido's stETH. Terms: $Pie 1:1 mint/burn, validator commitment, fee revenue share.
   *$Pie has never appeared in any post — completely untouched.*
3. **Reward distribution prevents the "rich get richer" problem** — why giving 90% to
   the lowest tier is strategic. Terms: 90% Workers, 10K/100K/1M, 0% inflation.
4. **Retium for gaming** — instant finality + $0.01 fees + no MEV = playable on-chain.
   Terms: HardFinal, weight-based fees, no mempool, no MEV, WASM.

Already used, so NOT fresh: Early Validator Round pricing (day 20) · Safehouse vs token
sales (days 7, 14) · halt-and-fix (day 15) · Matchmaker rotation (days 13, 21).

## Before writing week 4

- [ ] Pick 5 topics that clear the consumed list above
- [ ] One post per required type (repost+comment, external reply, X Community, timeline, comment)
- [ ] 8–10 established terms per post, all from the 🟢 list in PROMPTS.md
- [ ] Choose an originality framework (trace / comparison / game theory / what-if / developer)
- [ ] Long-form posts 2,000–3,500 chars
- [ ] `python3 tools/retium_lint.py` clean
