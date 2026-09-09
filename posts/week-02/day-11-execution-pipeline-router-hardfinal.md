# Day 11 · THE RETIUM EXECUTION PIPELINE: FROM ROUTER TO HARDFINAL

> **Week 2** · Day 11 · Retium X Community Post · Required #3 · Aug 21 2026 · 3,134 chars · X post for @RetiumChain

**Goal:** Write the end-to-end routing-to-finality reference.

## 📋 Post — copy & paste

```text
a question that keeps coming up in the Retium community: what actually happens to a transaction between submission and finality?

here's the full execution pipeline, step by step, with the specific components involved at each stage:

𝟭. 𝗦𝘂𝗯𝗺𝗶𝘀𝘀𝗶𝗼𝗻 → 𝗗𝗶𝗿𝗲𝗰𝘁 𝗥𝗼𝘂𝘁𝗶𝗻𝗴

when you sign a transaction on Retium, it does NOT enter a public mempool. there is no shared pending queue for bots to monitor or manipulate.

instead, the signed payload transmits directly to the Router. the Router performs immediate task evaluation — inspecting transaction type, state access bounds, and computational requirements. it then directs the payload into an active open block within PrimeMesh.

the RouterHelper assists by balancing workloads across available mesh positions, scaling between 3 and 20 parallel open blocks based on real-time throughput demand.

this is where MEV dies at the ingress layer. no public staging = no front-running surface.

𝟮. 𝗣𝗮𝗿𝗮𝗹𝗹𝗲𝗹 𝗘𝘅𝗲𝗰𝘂𝘁𝗶𝗼𝗻 𝗶𝗻𝘀𝗶𝗱𝗲 𝗣𝗿𝗶𝗺𝗲𝗠𝗲𝘀𝗵

once routed, the transaction executes inside an open PrimeMesh block. unlike linear chains where Block N must complete before Block N+1 begins, PrimeMesh allows concurrent workloads across distinct mesh coordinates simultaneously.

block positions are derived from prime-number factorization (PNLA). block 15 = 3 × 5, so it links to blocks 3 and 5. this is deterministic — no validator chooses the position, the math does.

𝟯. 𝗪𝗼𝗿𝗸𝗲𝗿 𝗤𝘂𝗼𝗿𝘂𝗺 𝗩𝗮𝗹𝗶𝗱𝗮𝘁𝗶𝗼𝗻

execution is handled by Workers (minimum stake: 10,000 RTM). but Workers don't operate alone.

a dynamic Matchmaker algorithm assigns a randomized 5-Worker quorum per task. each Worker independently executes the transaction, verifies local state transitions, and produces a result. a 3/5 matching quorum is required to validate the candidate block.

this randomization prevents collusion — you can't predict which Workers will process your transaction, and you can't bribe a quorum you can't identify in advance.

𝟰. 𝗞𝗲𝗲𝗽𝗲𝗿 𝗜𝗻𝘁𝗲𝗴𝗿𝗮𝘁𝗶𝗼𝗻

Keepers maintain PrimeMesh topology and handle inter-block state routing. they recompute deterministic global mathematical proofs across nodes, ensuring that parallel blocks remain consistent with the overall mesh state.

Keepers are the infrastructure backbone — they don't execute transactions, but they ensure the mesh stays coherent.

𝟱. 𝗦𝘂𝗶𝘁 𝗩𝗲𝗿𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻 + 𝗛𝗮𝗿𝗱𝗙𝗶𝗻𝗮𝗹

Suits (minimum stake: 100,000 RTM) are high-responsibility consensus anchors. they aggregate candidate blocks from Workers, verify Keepers' deterministic proofs, coordinate finality votes, and maintain state synchronization.

once a block passes Suit verification, it transitions into HardFinal settlement — a deterministic finality checkpoint where confirmed transactions are mathematically final and immune to chain reorganizations.

there is no "probabilistic" finality. no "wait N blocks." once HardFinal, it's permanent.

𝗳𝘂𝗹𝗹 𝗽𝗶𝗽𝗲𝗹𝗶𝗻𝗲 𝘀𝘂𝗺𝗺𝗮𝗿𝘆:

Sign → Router → RouterHelper → PrimeMesh → Worker Quorum (Matchmaker, 3/5) → Keeper Integration → Suit Verification → HardFinal

the whitepaper gives the theory. the testnet gives the proof. both are available now.

wallet.retium.org

@RetiumChain
```

## 🎨 Visual notes

No visual was produced for this post (it is already published). If you ever re-run this topic, see `IMAGE_PROMPT.md`.

## 🏆 Score

- Not scored yet — fill this in when the scorer posts results.

## 🚀 Status

- [x] Text ready · - [ ] Posted on X — *Day 11, Week 2*
