# Day 24 · REPOST AN OFFICIAL MESH POST: KEEPERS, THE TIER NOBODY TALKS ABOUT

> **Week 4** · Day 24 · Retium Repost + Comment · Required #1 · Sep 9 2026 · 1668 chars · X post for @RetiumChain

**Goal:** Give the 1M RTM tier its own explanation.

## 📋 Post — copy & paste

```text
most explanations of Retium stop at Workers and Suits. the tier I keep coming back to is the third one: Keepers.

Workers (10,000 RTM) execute. Suits (100,000 RTM) finalize. Keepers (1,000,000 RTM) do neither — and the network doesn't hold together without them.

here's what they actually do.

Keepers maintain PrimeMesh topology and handle inter-block state routing. that's the unglamorous half of a multi-dimensional mesh: when blocks are not arranged in a single line, something has to know how state travels between them.

they also recompute deterministic global mathematical proofs across nodes. that's the consistency check — the thing that guarantees blocks processing in parallel still add up to one coherent state.

why that matters architecturally:

𝟭. 𝗽𝗮𝗿𝗮𝗹𝗹𝗲𝗹𝗶𝘀𝗺 𝗻𝗲𝗲𝗱𝘀 𝗮 𝗿𝗲𝗳𝗲𝗿𝗲𝗲
if multiple blocks process simultaneously, someone has to verify the parallel work stays consistent with the mesh. that's Keepers. without it, parallelism and consistency trade off against each other.

𝟮. 𝗻𝗼 𝘀𝗶𝗻𝗴𝗹𝗲 𝘁𝗶𝗲𝗿 𝗵𝗼𝗹𝗱𝘀 𝘁𝗵𝗲 𝗽𝗶𝗽𝗲𝗹𝗶𝗻𝗲
Workers can't finalize. Suits can't execute. Keepers don't validate. capturing one role gets you a slice of the pipeline, not the pipeline.

𝟯. 𝘁𝗵𝗿𝗲𝗲 𝘁𝗶𝗲𝗿𝘀 𝗿𝗲𝗮𝗹𝗹𝘆 𝗮𝗿𝗲 𝘁𝗵𝗿𝗲𝗲 𝗷𝗼𝗯𝘀
role separation is why a 10,000 RTM Worker, a 100,000 RTM Suit and a 1,000,000 RTM Keeper are genuinely different jobs rather than three sizes of the same one.

the interesting design choice is that the highest-stake tier does the least visible work. no user ever sees topology maintenance. but it's the tier that makes the parallel structure safe to run at all.

worth understanding if you're evaluating how the mesh holds together under load.

@RetiumChain
```

## 🎨 Visual notes

No visual yet — none is required for this post. If one is produced later, save it
next to this file as `day-24-keepers-mesh-topology.png` (or `.jpg`) and the dashboard will pair it
automatically. See `IMAGE_PROMPT.md` before generating anything.

## 🏆 Score

- Not scored yet — fill this in when the scorer posts results.

## 🚀 Status

- [x] Text ready · - [ ] Posted on X — *Day 24, Week 4*
