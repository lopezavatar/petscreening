# Pie In The Sky — Design System

## Overview

**Pie In The Sky (PITS)** is a small, artisanal drone pie delivery service. There is one kitchen, one product (their signature pie), and one order flow: a customer requests one pie delivered ASAP via drone. The brand is built around warmth, whimsy, and absolute simplicity. No customization. No menus. Just pie — flying to your door.

**Sources provided:** Company description only. No codebase or Figma assets were provided. This design system was originated from scratch.

---

## Products / Surfaces

| Surface | Description |
|---|---|
| **Web ordering app** | The single-screen ordering interface. Customer presses one button. That's it. |
| **Brand identity** | Logo, color, type — for use in any future collateral, packaging, or marketing |

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Warm and confident.** PITS knows it makes great pie. It doesn't need to oversell.
- **Charming and brief.** Copy is short, direct, and slightly whimsical. No filler words.
- **We → You framing.** The brand speaks to the customer ("Your pie is on its way") not about itself.
- **Present tense, active voice.** "Your pie flies to you" not "Pies are delivered by drone."
- **Never corporate.** No "solutions," no "leveraging," no "seamless experiences."

### Casing
- Headlines: **Title Case** for brand moments; **Sentence case** for UI labels.
- CTAs: **ALL CAPS** sparingly — only for the primary action button.
- No exclamation points (the product sells itself).

### Specific Examples
> "One pie. One button. One very happy you."
> "Your pie is airborne."
> "We bake one thing. It's incredible."
> "Order" (the only CTA — no embellishment needed)
> "On its way. Estimated arrival: 12 min."
> "Sold out for today. Back tomorrow at 9am."

### Emoji
**No emoji.** The brand uses a clean illustration style; emoji would undercut the craft aesthetic.

### Numbers
Always use numerals (1 pie, 12 min), never spelled out in UI contexts. In marketing copy, spelling can add warmth ("one pie").

---

## VISUAL FOUNDATIONS

### Color Vibe
Warm, bakery-first. The palette is built around pie crust amber and sky blue, grounded in cream and deep brown. Cherry red is used sparingly as an accent.

### Backgrounds
Cream (`--cream`, #FDFAF5) for app backgrounds. Deep crust brown for high-contrast hero moments. Sky blue mid-tones for drone/delivery status screens. No gradients in UI. Brand collateral may use subtle cream-to-amber radial gradients.

### Typography
- **Display:** Playfair Display — a warm, editorial serif. Used for headlines, logo lockup, hero moments.
- **Body:** DM Sans — clean, friendly, highly legible. Used for all UI labels, body copy, status messages.
- **Mono:** Not used in the product; reserved for internal/developer contexts if needed.
- Type scale is generous; the UI is intentionally minimal so text has room to breathe.
- ⚠️ *Substitution: Playfair Display and DM Sans sourced from Google Fonts. Request brand-original font files if they exist.*

### Spacing
8px base grid. Spacing tokens: 4, 8, 16, 24, 32, 48, 64, 96px. Generous internal padding (32px+) in cards. The UI is sparse — whitespace is a feature.

### Corner Radii
- **Pill:** 9999px — for primary action buttons only.
- **Card:** 16px — for order cards, status panels.
- **Small:** 8px — for badges, tags.
- No sharp corners anywhere in the UI.

### Shadows
Soft, warm-toned drop shadows. No cold blue/gray shadows.
- **Card shadow:** `0 4px 24px rgba(92, 58, 30, 0.10)`
- **Elevated:** `0 8px 40px rgba(92, 58, 30, 0.16)`
- No inner shadows. No neumorphism.

### Borders
Minimal. `1px solid var(--border)` (warm stone tone) on cards when background contrast is low. No heavy borders.

### Animation & Motion
- **Easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` — a gentle spring overshoot for the drone icon and order button.
- **Duration:** 300ms for UI transitions; 600ms for status state changes.
- **Drone animations:** floating/bobbing loop (translate Y, 6s ease-in-out infinite).
- **No abrupt cuts.** Everything fades or slides.

### Hover & Press States
- Buttons: darken background by ~10%, no scale.
- Primary CTA: subtle lift (`transform: translateY(-2px)`) + shadow increase on hover.
- Press: `transform: scale(0.97)` on the CTA button.
- Links: color shift to `--cherry`, no underline by default.

### Imagery
- Warm, golden-hour photography. Think: steaming pie on a windowsill, blue sky with clouds.
- Slight warm grain/film overlay on photos where used.
- Illustration style: simple, flat with soft line weight. No 3D renders.
- Drone illustrations: minimal line art, not detailed technical drawings.

### Cards
Cream or white fill, 16px radius, `--shadow-card` drop shadow. Internal padding 24–32px. No colored left-border accents.

### Transparency & Blur
Used for status overlay panels: `backdrop-filter: blur(12px)` with `rgba(253,250,245,0.85)` — frosted cream glass effect. Used sparingly.

### Layout
Centered, single-column on mobile/web. Max content width 480px. The app is intentionally one-screen, no navigation, no menus.

---

## ICONOGRAPHY

No dedicated icon library. The brand uses:
- **Minimal bespoke SVG icons** inline: pie dish, drone propeller, cloud, checkmark.
- **No icon font loaded.** Icons are SVG only.
- Stroke style: 1.5px, rounded caps and joins, color inherits from context.
- Size: 24×24px standard; 48×48px for hero/status moments.
- Emoji: never used as icons.
- Lucide icons (CDN) are an acceptable substitute for utility icons (close, chevron, etc).

See `assets/` for logo and icon SVGs.

---

## File Index

```
README.md                    — This file; design system overview
SKILL.md                     — Agent skill definition
colors_and_type.css          — CSS custom properties: colors, type, spacing, shadows
assets/
  logo.svg                   — Primary wordmark + icon lockup
  logo-icon.svg              — Icon only (pie + drone)
  icon-pie.svg               — Standalone pie icon
  icon-drone.svg             — Standalone drone icon
preview/
  colors-brand.html          — Brand color palette swatches
  colors-semantic.html       — Semantic color tokens
  type-display.html          — Display type specimens
  type-body.html             — Body type scale
  spacing.html               — Spacing tokens
  shadows-radii.html         — Shadow + radius tokens
  btn-primary.html           — Primary button states
  btn-secondary.html         — Secondary button states
  badge.html                 — Status badges
  card-order.html            — Order card component
  status-panel.html          — Delivery status panel
  logo-brand.html            — Logo variants
ui_kits/
  web/
    README.md                — Web app UI kit notes
    index.html               — Interactive ordering prototype
    OrderButton.jsx          — The big CTA button
    StatusPanel.jsx          — Delivery tracking panel
    SoldOut.jsx              — Sold out / unavailable state
```
