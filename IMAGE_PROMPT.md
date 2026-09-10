# 🎨 Image prompt — Retium

**v1.0 — validated 2026-09-10 on the five week-4 renders.**

## The one rule: never let the model draw text

Image models garble text. So the render is generated with **no text, no letters, no
words, no numbers**, and every word is added afterwards with a real font by
`tools/finish_image.py`. This is why the captions on the approved renders are crisp.
Never ask the model for text — not even a headline.

## Pipeline

```bash
# 1. generate the artwork (no text, empty top-left, empty bottom band)
#    -> raw-NN.png
# 2. crop to 16:9, draw the caption, paste the official logo
python3 tools/finish_image.py raw-22.png final-day-22.png \
    --headline "THE FEE IS A CONSTANT" --sub '$0.01 · KNOWN BEFORE YOU SUBMIT'
# 3. save next to the post as <post-basename>.png -> the dashboard pairs it
```

## Render prompt (the working template)

```
Abstract <concept> on a near-black #1f1918 background. <describe the diagram>,
accent in vivid orange #fc450a, muted grey for the rest. Clean, minimal, precise,
thin strokes, subtle glow. Absolutely NO text, NO letters, NO words, NO numbers
anywhere in the image. No people, no faces, no hands. Keep the top 22 percent of
the frame as completely empty dark background, and keep the bottom 20 percent as
empty dark background.
```

The two empty bands are load-bearing: the logo goes top-left, the caption bottom-left.

## Layout (fractions of image size, set in `tools/brand_logo.py`)

| Element | Position |
|---|---|
| Logo | left edge `0.050·W`, height `0.110·H`, v-centre `0.155·H` |
| Headline | left `0.050·W` + rule, bottom-anchored at `0.945·H`, DejaVu Sans Bold, ~`0.072·H`, near-white `#ededed` |
| Sub-line | below the headline, DejaVu Sans Regular, ~`0.038·H`, brand `#fc450a` |
| Brand rule | thin `#fc450a` bar immediately left of the text block |
| Site link | `retium.org`, bottom **right** at `0.95·W`, grey `#9b9ba3` |

Output is centre-cropped to 16:9 (1365×768 from a 1408×768 render) for X.

## Logos

All four official files in `brand/` are **monochrome** — never recolour them.

| File | Use on |
|---|---|
| `retium-logo-horizontal-ondark.png` (573×106, light ink) | dark renders — the default |
| `retium-logo-horizontal-onlight.png` (573×106, dark ink) | light renders (`--light`) |
| `retium-logo-vertical-ondark.png` / `-onlight.png` (415×212) | square layouts |

⚠️ Brand palette came from the owner, not the artwork: **#fc450a** primary,
**#1f1918** brand dark. (Earlier notes disagreed — week 1 said blue, week 2 said
#E04000 orange. #fc450a is now confirmed as current.)

## Which posts get an image

Long-form only: **Personal Timeline, X Community, Repost + Comment, and both bonus
posts.** Skip the **External Engagement Reply** and the **Comment on a Retium Post** —
they hang off someone else's post, and a graphic there reads as spam. That's 5 of 7
per week, matching the pattern the owner used in week 2.

## Content rules

- No people, no faces, no hands — spell this out whenever the subject implies figures.
- Diagram-style reference graphics (fee ladders, ring charts, pipelines, mesh
  lattices). These get saved and shared, unlike mood imagery.
- Never put a 🔴 banned term in image text. If a component is named it must be a 🟢
  established one (Router, Matchmaker, PrimeMesh, HardFinal, PNLA, Keepers).
- Any number shown must be on the green list ($0.01–$0.45, Weight 1–5, 10K/100K/1M, 90%).

## Workflow

1. Render one. 2. **Owner approves in chat.** 3. Save as the post basename + `.png`.
4. Rebuild. Nothing is committed before approval.

## Changelog

- **v1.0 — 2026-09-10.** Validated on week 4 (days 22, 24, 25, 27, 28), approved first
  pass with one change: add the site link bottom-right. Locked in: no model-drawn text,
  16:9, logo placement above, brand #fc450a on #1f1918, long-form-only images.
- **v0.1 — 2026-09-10.** Initial version. Logos catalogued; placement constants
  inherited from the sibling projects and untested.
