# RETIUM WEEK 4 (Days 22–28) · Fees as a Design Surface, $Pie, and Settlement
### September 7–13, 2026 · Voice: developer / technical

First week written from scratch in this repo. Built against `PROMPTS.md`, checked with
`tools/retium_lint.py` (clean), and chosen to avoid every topic consumed in weeks 1–3.

## Slate

| Day | Date | Type | Req | Topic | Framework |
|-----|------|------|-----|-------|-----------|
| 22 | Sep 7 | Personal Timeline Post | Required #4 | What a One-Cent Fee Actually Unlocks | Developer perspective |
| 23 | Sep 8 | External Engagement Reply | Required #2 | $Pie is a receipt, not a reward token | Comparison |
| 24 | Sep 9 | Retium Repost + Comment | Required #1 | Keepers, the tier nobody talks about | Missing-piece explainer |
| 25 | Sep 10 | Retium X Community Post | Required #3 | Validator economics with 0% inflation | Economics / game theory |
| 26 | Sep 11 | Comment on Retium Post | Required #5 | Priority credits have a ceiling | Sharp single point |
| 27 | Sep 12 | Additional Post #1 | Bonus | Retium for gaming | What-if / use case |
| 28 | Sep 13 | Additional Post #2 | Bonus | HardFinal and the settlement use cases | Use-case translation |

All five required types present, plus two bonus posts. One post per day — the
programme caps you at 1 per UTC day.

## 🎯 Why these topics

Four came from the seed list in `posts/week-03/_overview.md`:

- **Fee model → micro-transactions** (seed 1) → day 22
- **$Pie vs liquid staking** (seed 2) → day 23, with day 25 taking the related
  "reward distribution / no inflation" angle (seed 3)
- **Retium for gaming** (seed 4) → day 27

Three are new angles that clear every consumed list:

- **Day 24 — Keepers.** Every earlier post mentions the tier; none is about it. The
  1,000,000 RTM tier maintains PrimeMesh topology and recomputes the deterministic
  proofs that keep parallel blocks coherent.
- **Day 26 — priority credits.** Appeared in passing in day 4, never on its own. The
  point is that the multiplier is *bounded* ($0.54 worst case) where a gas auction is not.
- **Day 28 — settlement use cases.** Day 18 compared finality tiers across chains;
  this is about what deterministic settlement lets you actually build (RWA, payroll,
  audit-friendly reconciliation).

## 🔁 Consumed topics — DO NOT REPEAT

Cumulative, weeks 1–4. Check this before drafting anything new.

- Fee predictability as a design constraint; per-action billing, subscriptions,
  micropayments (day 22)
- $Pie as a 1:1 staking receipt vs a liquid staking derivative (day 23)
- Keepers: mesh topology, inter-block state routing, deterministic proofs (day 24)
- Fee-funded security budget; 0% inflation; no terminal subsidy; 90/5/3/1/0.5/0.5
  distribution; burn inside the distribution (day 25)
- Priority credits as a bounded multiplier, $0.54 ceiling (day 26)
- Gaming: instant confirmation + flat fees + no front-running + WASM (day 27)
- HardFinal for settlement, RWA, payroll, audit reconciliation (day 28)

Plus everything in weeks 1–3: PNLA/forks, parallel blocks, Rust from scratch, the fee
table, Safehouse/zero allocation, WASM + Unified Contract Layer, RCP-1, the Router →
HardFinal pipeline, validator accessibility, rotation vs cartels, the testnet reset,
tri-role security, no-mempool routing, two finality tiers, Early Validator Round
pricing, Matchmaker game theory.

## 🟢 Term audit: CLEAN

No banned terms, no caution terms. Every specific number used appears on the green
list: Weight 1–5 ($0.01–$0.45), $0.54 ceiling, 10K / 100K / 1M RTM, 90 / 5 / 3 / 1 /
0.5 / 0.5 distribution, 1 billion fixed supply, 0% inflation, +10% / +20% priority.

Deliberately avoided: "1% fee burn" (caution — reframed as "1% of each finalized
block's reward allocation is permanently burned"), "3-20 blocks", "SoftFinal",
"interoperability".

---

# 🌱 WEEK 5 SEEDS

Angles that still clear the full consumed list above:

1. **The oracle rate** — what happens to a USD-denominated fee when RTM moves. Fee
   stability mechanics and what it means for a project treasury holding RTM to pay
   fees. Never covered on its own.
2. **"What if 40% of Workers go offline at once?"** — a what-if walkthrough that lands
   on halt-and-fix vs fork-and-hope. Day 15 told the reset story; this is the scenario
   version, and it uses the no-fork property directly.
3. **Reading a PrimeMesh block** — a hands-on walkthrough of how block 15 = 3 × 5 links
   to blocks 3 and 5, and what a developer sees when they inspect the mesh. Developer
   literacy angle; days 1 and 19 argued the property, neither reads the structure.
4. **One audit surface** — the Unified Contract Layer framed as an audit and security
   economics decision rather than a developer-convenience one. Day 6 covered what it
   is; this is what it costs you *not* to have it.
5. **Wallet to first transaction** — the onboarding trace end to end using Wallet
   Connect and the wallet, for developers evaluating the chain.
