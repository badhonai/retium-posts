# 🎨 Image prompt — Retium

**Status: v0.1, unvalidated.** No graphics have been produced for this project yet —
weeks 1–3 shipped as text only. Nothing here has been approved by the owner, so treat
every value as a starting point and get a render approved before making more.

---

## Logos

Four official files in `brand/`. All four are **monochrome** — there is no brand colour
in them to sample.

| File | Size | Use on |
|---|---|---|
| `retium-logo-horizontal-onlight.png` | 573×106 | light backgrounds (dark ink) |
| `retium-logo-horizontal-ondark.png` | 573×106 | dark backgrounds (light ink) |
| `retium-logo-vertical-onlight.png` | 415×212 | light backgrounds, square-ish layouts |
| `retium-logo-vertical-ondark.png` | 415×212 | dark backgrounds, square-ish layouts |

Picking the wrong variant is the most common error — check the background first.

⚠️ **Open question for the owner:** the week-1 notes say "Retium's blue branding
colours"; the week-2 notes say "#E04000 orange + white bg". Confirm the current accent
before generating anything with colour.

## Logo placement

`tools/brand_logo.py` composites the logo onto a render. Its constants are inherited
from the sibling projects and have **not** been tuned for the Retium logotype:

| Constant | Value | Meaning |
|---|---|---|
| `LEFT` | 0.0581 × W | left inset |
| `W` | fraction of width | logo width |
| `HFRAC` | 0.1953 × H | logo height |
| `VCENTER` | 0.1914 × H | vertical centre of the logo band |

The Fluton logotype (3.9:1) needed a wider empty zone than Utexo's. Retium's horizontal
mark is 5.4:1 — wider again — so expect to widen the band. Keep the top ~26% clear of
subject matter so the logo never overlaps anything.

## Composition rules

- No people, no faces, no hands — spell this out whenever the subject implies figures.
- Diagram-style renders suit this content: fork vs mesh, fee tables, pipeline flows,
  comparison grids. These are reference graphics people save, not mood images.
- Never put a 🔴 banned term in the image text. If a graphic names a component, it must
  be a 🟢 established one (Router, Matchmaker, PrimeMesh, HardFinal, PNLA).
- Any number shown must appear in the 🟢 list ($0.01–$0.45, Weight 1–5, 10K/100K/1M, 90%).
- Keep text minimal. If it needs a paragraph to make sense, it is the wrong image.

## Workflow

1. Render one image.
2. **Owner approves in chat** — nothing gets committed without it.
3. Save as the post basename + `.png` so the dashboard pairs it automatically.
4. Rebuild, then record what worked here so the next one starts from a validated spec.

## Changelog

- **v0.1 — 2026-09-10.** Initial version. Logos catalogued (all monochrome); placement
  constants inherited and untested; no renders produced yet.
