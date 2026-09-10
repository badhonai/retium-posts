# AGENTS.md — retium-posts

Handbook for any AI session working in this repo. Read it before touching anything.
This is the **Retium** project. Content must never be mixed with the Fluton or Utexo
repos (structure and tooling may be copied; posts, facts and branding may not).

---

## 📦 Images are not kept on disk — two rules

Post images are the biggest thing in this repo, so they are hidden from the
working tree by default. They are still in git and still on the deployed site:
every image is base64-embedded in the committed `app/src/data.json`, and
`build_dashboard.py` reuses that when the `.png` is not present. A rebuild with
zero images on disk produces a byte-identical result.

```bash
tools/images.sh status   # what is on disk, what is hidden
tools/images.sh on       # bring every image back
tools/images.sh off      # hide them again
tools/images.sh week 4   # bring back just week 4
```

**Rule 1 — `images.sh on` BEFORE you generate or commit a week's images.**
While images are hidden, git cannot see a new `.png`, so it would silently miss
the commit.

**Rule 2 — `images.sh off` AFTER committing them.** Keeps the workspace small.

Writing posts or rebuilding needs neither. If an image ever looks missing, run
`tools/images.sh status` first — that is almost always the explanation.

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
  last number used (currently 28, so the next week starts at 29).
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
7. **All browser storage goes through `LS` in `app/src/data.js`.** The file preview
   renders in a sandboxed iframe where `localStorage` throws a SecurityError, so the
   helpers keep the dashboard running there (it just cannot persist). Never call
   `localStorage` directly — a direct call blanks the whole app in the preview.

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

- **As of 2026-09-10 (session 2 — week 4 written, points simplified, rebranded):**
  - **WEEK 4 WRITTEN (days 22–28, Sep 7–13 2026), 7 posts, text ready, not yet posted.**
    First week authored from scratch in this repo. Slate: 22 fee model → what $0.01
    unlocks (Req #4 timeline) · 23 $Pie is a receipt not a reward (Req #2 external
    reply) · 24 Keepers, the tier nobody talks about (Req #1 repost) · 25 validator
    economics with 0% inflation (Req #3 X Community) · 26 priority credits have a
    ceiling (Req #5 comment) · 27 Retium for gaming (bonus) · 28 HardFinal settlement
    use cases (bonus). All five required types present + 2 bonus, one per day.
    Four topics came from the seed list in `posts/week-03/_overview.md`; the other three
    are new angles that clear every consumed list. `tools/retium_lint.py`: 0 findings.
  - **POINTS ARE NOW A SINGLE NUMBER PER POST.** Owner's call: no category breakdown in
    the app. Each post file holds `- Score: 87`; the old five-category figures survive
    only as a reference note under the Score block. The dashboard has one field.
    Do not reintroduce the category form.
  - **NO GRAND TOTAL IN THE DASHBOARD.** Home shows the current week only
    ("W4 pts · n/7 scored"). The Points sheet leads with the current week and lists all
    weeks. The exported JSON carries `current_week`, a per-week breakdown, and one row
    per post with its `id`. Keep it that way.
  - **BRAND: primary #fc450a, brand dark #1f1918.** The old green #3fb37f is now the
    secondary accent. Applied to the accent colour, lock screen, favicon and theme
    colour. ⚠️ All four official logos are monochrome, so the palette came from the
    owner, not from the artwork.
  - **WEEK 4 IMAGES SHIPPED — 5 of 7 (days 22, 24, 25, 27, 28).** Long-form posts get an
    image; the external reply (23) and the comment (26) are deliberately text-only.
    Pipeline is locked in `IMAGE_PROMPT.md` v1.0: the model never draws text, captions go
    on afterwards in DejaVu via `tools/finish_image.py`, 16:9, official logo top-left,
    `retium.org` bottom-right. Brand orange #fc450a on near-black #1f1918.
  - 28 posts total, 8 scored, 661.46 points on record (weeks 1 and 3; week 2 was never
    recorded and week 4 is unscored).
  - Lock password `king`. All browser storage goes through `LS` in `app/src/data.js`.
  - **NEXT: Week 5 — days 29+.** Seeds are in `posts/week-04/_overview.md`: the oracle
    rate · "what if 40% of Workers go offline" · reading a PrimeMesh block · one audit
    surface (Unified Contract Layer) · wallet-to-first-transaction onboarding.
