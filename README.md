# retium.posts

Posting pipeline and score tracker for the **Retium Community Contribution Program** —
a points-based contest where every published post is scored out of ~100.

Every post lives here as a markdown file, the rules that maximise the score live in
[`PROMPTS.md`](PROMPTS.md), and a dashboard tracks what is posted and how many points
each post earned.

---

## 📊 Status

| Week | Days | Posts | Scored | Points |
|------|------|-------|--------|--------|
| 1 (Aug 10–16) | 1–7 | 7 | 5 | 407.47 |
| 2 (Aug 18–24) | 8–14 | 7 | 0 | not recorded |
| 3 (Aug 25–31) | 15–21 | 7 | 3 | 253.99 |
| 4 (Sep 7–13) | 22–28 | 7 | 0 | awaiting scores |
| **Total** | | **28** | **8** | **661.46 on record** |

Average 82.68 across the 8 scored posts · Best `w3-d21-matchmaker-cartels-game-theory` (90.56)

**Current week: Week 4** — all seven posts are written and awaiting publication.

Each week covers all five required post types plus two bonus posts, and the programme
caps you at one post per UTC day.

---

## 🏆 Recording and exporting points

Open the dashboard, unlock it (password `king`), then:

1. **Mark as posted** — open any post and tap *Mark as posted*.
2. **Enter the score** — the same sheet has a field for each category
   (base / accuracy / originality / engagement / consistency). The total updates as you
   type; *Save score* stores it.
3. **Export** — *🏆 Points & export* shows total, average, best post and a per-category
   breakdown, and lets you copy or download the JSON.

Scores already confirmed by the scorer are written into each post's `## 🏆 Score` block,
so they seed the dashboard automatically. Editing a score in the dashboard updates your
browser copy only; it does not rewrite the post file.

Every exported row carries a stable id so a number can always be traced to a post:

```json
{
  "id": "w1-d04-fee-model-developer-guide",
  "day": 4,
  "week": 1,
  "slug": "fee-model-developer-guide",
  "title": "A DEVELOPER'S GUIDE TO RETIUM'S FEE MODEL ($0.01 TO $0.45)",
  "type": "Retium X Community Post",
  "requirement": "Required #3",
  "posted": false,
  "points": { "base": 30, "accuracy": 21, "originality": 12, "engagement": 2.84, "consistency": 15, "total": 80.84 }
}
```

Posted marks and scores live in this browser. Use **Backup & restore** to move them to
another device.

---

## 📁 Layout

```
posts/week-NN/day-NN-slug.md   one file per post, text verbatim
posts/week-NN/_overview.md     slate + consumed topics (no-repeat record) + next-week seeds
PROMPTS.md                     the scoring rules to write against
docs/                          the original master prompt
app/                           React dashboard
tools/                         build, lint, import
site/index.html                built single file - this is what gets deployed
brand/                         official logos
```

## 🛠 Working on it

```bash
python3 tools/retium_lint.py          # check every post against the scoring rules
python3 tools/retium_lint.py --audit  # also list banned terms in the published weeks
python3 tools/build_dashboard.py      # rebuild site/index.html
```

Deploy `site/index.html` (Vercel root dir: `site`). `app/index.html` is the Vite entry
and renders blank on its own.

## ⚠️ Before writing a new post

The scorer deducts 2–4 points per **unestablished** term. Five of them turned a ~90 post
into a 73 — see day 17. Always run the linter, and always check the consumed-topic lists
in `posts/week-*/_overview.md` so nothing repeats.
