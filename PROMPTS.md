# 📝 How to write a Retium post

The operational version of the scoring rules. The full source is
[`docs/MASTER_PROMPT_retium_scoring_guide.md`](docs/MASTER_PROMPT_retium_scoring_guide.md)
— read it once, then work from this file.

**The one rule that matters most:** every unestablished term costs 2–4 accuracy
points. Five bad terms turned a ~90 post into a 73. Post #6 and post #7 in the
scoring history are the same author on the same topic; the only real difference
was the vocabulary.

---

## 1. Score breakdown

| Category | Max | Notes |
|---|---|---|
| Base | 30 | Automatic for any valid submission |
| Accuracy & relevance | 30 | Uses **only** established terms; every unestablished term costs 2–4 |
| Originality | 20 | Genuine personal analysis, synthesis across features, fresh framing |
| Engagement | 15 | Likes/retweets/replies — you control this, not the writing |
| Consistency & quality | 15 | Structure, clarity, professional tone |

**90–100 post:** 10+ established terms, an original analytical framework,
synthesis of multiple features into one argument, specific numbers, clear sections.
**73 post:** 3–5 unestablished terms, restating features, generic framing.

---

## 2. Term database

### 🟢 Always safe — pack these in

**Architecture:** PrimeMesh · PNLA / Prime Number Linking Architecture ·
prime-number factorization · deterministic structure · no-fork behavior ·
halt-and-fix safety mode · genesis reset · multi-dimensional mesh ·
block 15 = 3 × 5 · "if a block does not fit the PrimeMesh, it is rejected" ·
"the structure is determined by mathematics before a block can take its place"

**Routing & execution:** Router · Matchmaker · Matchmaker 5-Worker quorum ·
deterministic-but-unpredictable assignment · continuous rotation · no mempool ·
no MEV · parallel blocks / parallel processing

**Validators:** Workers (10,000 RTM) · Suits (100,000 RTM) · Keepers (1,000,000 RTM) ·
tri-role separation · role separation · 90% Worker fee share

**Fees & economics:** weight-based fees ($0.01 to $0.45) · Weight 1–5 ·
USD-denominated fees · oracle rate / oracle conversion · priority credits ·
0% inflation · fixed supply 1 billion RTM · no minting beyond genesis ·
no token allocation · $Pie staking token (1:1 mint/burn) ·
Safehouse (1 rUSD → 1 RTM, 1 RTM → 1 rUSD) ·
Early Validator Round ($100 Worker / $1,000 Suit) ·
reward distribution 90 / 5 / 3 / 1 / 0.5 / 0.5

**Smart contracts:** WASM smart contracts · built from scratch in Rust ·
Rust, AssemblyScript, or C · Unified Contract Layer / unified contract model

**Finality:** HardFinal (mathematically irreversible settlement) · instant finality ·
transaction-level finality

**Current status:** public testnet live · wallet.retium.org · NFT Launchpad ·
onboarding.retium.org

### 🟡 Use with caution — safe form vs penalised form

| Unsafe | Use instead |
|---|---|
| "3-20 parallel blocks" | "multiple blocks process simultaneously" / "parallel block processing" |
| "SoftFinal" as a named term | "instant finality" / "immediate confirmation after Worker quorum" |
| "1% fee burn" | "a portion of fees is permanently burned" / "protocol burn" |
| "interoperability" | "Unified Contract Layer" / "single contract model" |

### 🔴 Never use — each costs 2–4 accuracy points

```
RouterHelper          BLAKE3 / BLAKE3 seed      3/5 quorum · 3-out-of-5
Ed25519               RVM                       Wasmtime
100M fuel limit       RCP-1                     RotationLog
Hard Peer Cap         200 peer connections      Three-Point Hello Handshake
~10 MB application    6-step GUI wizard         230-410 MB / 180-200 MB RAM
20-30% / ~9% CPU      handshake details         batch minting 100 NFTs
native primitives     host functions
```

`tools/retium_lint.py` enforces this list mechanically. Run it before every commit.

---

## 3. Originality frameworks (pick one per post)

1. **Step-by-step trace** — follow a transaction from signing to HardFinal, naming
   the component that handles each step.
2. **Comparison framework** — Retium vs another chain on one specific dimension.
3. **Game theory** — analyse incentives; e.g. why cartels are expensive here.
4. **"What if" scenario** — e.g. what happens if 40% of Workers go offline at once.
5. **Developer perspective** — "as a developer, here's what X means for my dApp".

**Originality killers:** listing features without connecting them · generic hype
("game-changing", "revolutionary") · copy-pasting official posts · reusing another
contributor's framing.

---

## 4. Post structure

```
[HOOK — 2-3 lines]
  personal framing ("as a developer...") + bold claim or question

[BODY — 3-5 sections with bold headers]
  each section: 2-3 established terms + original analysis

[SYNTHESIS — 2-3 lines]
  connect every section into one argument

[CTA — 1-2 lines]
  wallet.retium.org or onboarding.retium.org, then @RetiumChain
```

Length: **2,000–3,500 characters** for timeline and X Community posts. Replies and
comments are naturally shorter — that is fine.

---

## 5. The five required post types (per week)

| # | Type | Scores best when |
|---|---|---|
| 1 | Retium repost + comment | Your comment adds original analysis, not praise |
| 2 | External engagement reply | Directly connects Retium to the topic being discussed |
| 3 | Retium X Community post | Educational, genuinely useful explanation |
| 4 | Personal timeline post | Original analysis, detailed threads |
| 5 | Comment on a Retium post | Sharp point or thoughtful question, short and clear |

Plus up to **2 bonus** posts of any type. **Max 1 post per UTC day.**

---

## 6. Pre-post checklist

**Accuracy**
- [ ] No term from the 🔴 list
- [ ] "SoftFinal", "3-20 blocks", "1% fee burn" all avoided in their specific form
- [ ] Every specific number appears in the 🟢 list
- [ ] Topic clears the consumed lists in `posts/week-*/_overview.md`

**Originality**
- [ ] Synthesising features into an argument, not listing them
- [ ] Personal framing present
- [ ] Uses a named framework from §3

**Structure**
- [ ] Hook, 3–5 bold sections, synthesis, CTA
- [ ] 2,000–3,500 chars for long-form
- [ ] Ends with wallet.retium.org / onboarding.retium.org and @RetiumChain

**Rules**
- [ ] Not already posted today (max 1 per UTC day)
- [ ] Does not repeat a topic from an earlier week
- [ ] `python3 tools/retium_lint.py` is clean

---

## 7. Verified technical reference

- **Architecture:** L1 built from scratch in Rust, not a fork. PrimeMesh
  multi-dimensional mesh; block positions from prime factorization (PNLA);
  block 15 = 3 × 5 links to blocks 3 and 5. Multiple blocks process
  simultaneously. No mempool — transactions go straight to the Router.
- **Execution:** Router → PrimeMesh → Matchmaker assigns a 5-Worker quorum →
  Workers execute and validate independently → matching approval gives
  transaction-level finality → Suits verify and push to HardFinal → Keepers
  maintain mesh topology and state routing.
- **Tiers:** Workers 10,000 RTM (execution) · Suits 100,000 RTM (finality) ·
  Keepers 1,000,000 RTM (topology).
- **Rewards per finalized block:** 90% Workers · 5% Foundation · 3% Keepers ·
  1% Burn · 0.5% Suits · 0.5% Treasury. Paid from real fees; 0% inflation.
- **Tokenomics:** $RTM fixed 1B supply, no minting beyond genesis, no team/VC/
  advisor allocation. $Pie mints 1:1 on stake, burns on unstake. Safehouse
  exchanges 1 rUSD ↔ 1 RTM.
- **Fees:** Weight 1 ($0.01) to Weight 5 ($0.45), USD-denominated via oracle rate.
  Priority credits: +10% (L1), +20% (L2).
- **Contracts:** WASM; Rust, AssemblyScript or C; Unified Contract Layer.
- **Status:** public testnet live, NFT Launchpad, Wallet Connect, Early Validator
  Round $100 Worker / $1,000 Suit (post-mainnet $1,000 / $10,000).

⚠️ Re-verify anything time-sensitive against retium.org and @RetiumChain before
posting. Do not carry facts forward from an older post without checking.
