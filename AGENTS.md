# AGENTS.md — retium-posts

Handbook for any AI session working in this repo. Read it before touching anything.
This is the **Retium** project. Content must never be mixed with the Fluton or Utexo
repos (structure and tooling may be copied; posts, facts and branding may not).

---

## What this repo is

A posting pipeline for the Retium Community Contribution Program, which is
**points-based**: each published post is scored out of ~100 (base 30 · accuracy 30 ·
originality 20 · engagement 15 · consistency 15). The repo holds every post, the
rules that maximise the score, and a dashboard that tracks posted state and points.

- `posts/week-NN/day-NN-slug.md` — one file per post, text verbatim
- `posts/week-NN/_overview.md` — theme, slate, **consumed topics (no-repeat record)**, next-week seeds
- `PROMPTS.md` — the operational scoring rules. **Read before writing any post.**
- `docs/MASTER_PROMPT_retium_scoring_guide.md` — the original full guide (source of truth)
- `app/` — React dashboard (Vite) · `tools/` — build + lint · `site/` — deployable single file
- `brand/` — the four official logos · `IMAGE_PROMPT.md` — rules for future graphics

---

## Naming contract

- **Weeks are contiguous labels, not fixed grids.** A week holds however many posts it
  has and closes when the next week opens. There is NO posts-per-week number: never
  compute totals as weeks × N, never render an empty slot, never show a "missing" week.
  Retium weeks happen to run 7 posts each because the programme requires 5 post types
  plus up to 2 bonus — that is a convention, not a slot count.
- **Day numbers are a global running counter and are never reused.** Continue from the
  last number used (currently 21, so the next week starts at 22).
- **Every post carries a stable id:** `w{week}-d{day:02d}-{slug}`,
  e.g. `w1-d04-fee-model-developer-guide`. The id appears in the dashboard and in every
  exported points row so a number can always be traced to an exact post. Never change
  a slug after it is committed — the id is derived from it.
- Image file = post basename + `.png`/`.jpg` (no images exist yet; the rule stands).

## Post file format

The dashboard builder parses these exactly — do not rename the headers.

```
# Day N · TITLE

> **Week W** · Day N · <Post Type> · <Required #N|Bonus> · <Mon D> 2026 · <n> chars · X post for @RetiumChain

**Goal:** one line

## 📋 Post — copy & paste
```text ... ```

## 🎨 Visual notes
## 🏆 Score            <- "- Base: 30" etc, only when the scorer has returned a result
## 🚀 Status
```

---

## Hard rules

1. **Never rewrite a published post.** Weeks 1–3 are already posted. Their text is the
   record of what actually went out and the basis of the no-repeat lists. Legacy posts
   contain banned terms (see each week's ⚠️ audit) — that is expected and grandfathered.
2. **Never reuse a banned term in a new post.** `tools/retium_lint.py` enforces it.
3. **Never repeat a topic.** Check every `posts/week-NN/_overview.md` consumed list
   before drafting.
4. **Max 1 post per UTC day.** All 5 required types must appear each week.
5. **Verified facts only.** Re-check anything time-sensitive against retium.org and
   @RetiumChain. Never carry a fact forward from an older post unverified.
6. **Owner's content is the owner's.** Do not "improve" wording in a post the owner
   has approved.

## Weekly workflow

1. Pick topics from the seeds in the newest `_overview.md`; clear them against every
   consumed list.
2. Write to `PROMPTS.md` §4 structure using a §3 originality framework; 2,000–3,500
   chars for long-form.
3. `python3 tools/retium_lint.py` — must be clean.
4. Commit + push the text.
5. Owner posts, then enters the returned score in the dashboard (or you enter it from
   the scorer's feedback and also write it into the post's 🏆 Score block).
6. `python3 tools/build_dashboard.py` → `site/index.html`. Vercel auto-redeploys.

## Tooling

- `python3 tools/build_dashboard.py` — parses posts → `app/src/data.json` → builds and
  inlines `site/index.html`. Auto-runs `npm install` if needed.
- `python3 tools/retium_lint.py` — banned/caution terms, length, tag, CTA, structure.
  `--audit` also reports the grandfathered weeks.
- `python3 tools/set_password.py '<pw>'` — change the lock password (currently `king`).
- `python3 tools/import_legacy_posts.py` — one-time importer for weeks 1–3, kept for
  provenance.

**Deploy:** only `site/index.html` is deployable (`app/index.html` is the Vite entry and
renders blank). Vercel root dir = `site`.

---

## STATE — where we left off (update this block every session!)

- **As of 2026-09-10 (session 1 — repo bootstrapped from scratch):**
  - `badhonai/retium-posts` existed on GitHub but was completely empty. This session
    created the whole structure and imported the owner's three existing week files.
  - **Weeks 1–3 imported verbatim** from `RTM_week1.md`, `RTM_week2.md` and
    `week3_corrected_posts.md` via `tools/import_legacy_posts.py`.
    Week 1 = days 1–7 (Aug 10–16) · Week 2 = days 8–14 (Aug 18–24) ·
    Week 3 = days 15–21 (Aug 25–31). 21 posts, 7 per week, all five required types
    present each week plus two bonus posts.
  - **8 posts have real scorer results** (from the master prompt's history), seeded into
    each post's 🏆 Score block and into the dashboard:
    d1 85 · d2 80 · d3 79.09 · d4 80.84 · d6 82.54 · d15 90.14 · d17 73.29 · d21 90.56.
    Total on record **661.46**, average 82.68, best = `w3-d21-matchmaker-cartels-game-theory`.
    Week 2 has no recorded scores — none of the eight scored posts map to it.
  - **Day 17 caveat:** 73.29 was returned for the ORIGINAL version of that post (it used
    RouterHelper, BLAKE3, "3-20 blocks", "3/5 quorum", SoftFinal). The file holds the
    corrected rewrite, which has not been re-scored.
  - **Dashboard built with a points system:** mark-as-posted (day-keyed
    `retium_posted_v1`) plus per-post score entry across the five categories
    (`retium_points_v1`). Scores already in the repo seed the app on first run and stay
    editable. **Points & export** sheet shows total, average, best post, a per-category
    breakdown, and exports JSON where every row carries its `id`. Verified end-to-end in
    a headless DOM: 21 rows, unique ids, totals reconcile to 661.46.
  - Brand: four official logos in `brand/`, all **monochrome** (no brand colour to
    extract). `*-onlight` = dark ink, `*-ondark` = light ink. Horizontal 573×106,
    vertical 415×212. ⚠️ **Open question:** week-1 notes say "blue branding", week-2
    notes say "#E04000 orange" — ask the owner which is current before making graphics.
  - Lock password `king`. `site/index.html` ≈ 233 KB.
  - **NEXT: Week 4 — days 22+.** Seeds are in `posts/week-03/_overview.md`: fee model →
    micro-transactions · $Pie vs liquid staking (never used at all) · reward
    distribution vs rich-get-richer · Retium for gaming.
