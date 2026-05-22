# Web App UI Kit — Pie In The Sky

## Overview
Single-screen ordering web app. The entire product is one screen:
- A beautiful hero with the day's pie
- One big ORDER button
- Post-order delivery tracking panel

## Screens
1. **Available state** — Pie is ready to order
2. **Ordering state** — Button press animation, transitioning
3. **Tracking state** — Drone is airborne, live ETA countdown
4. **Sold Out state** — Today's allotment gone; see you tomorrow
5. **Delivered state** — Confirmation, thank you moment

## Design Width
390px (iPhone 14 Pro) — but fully responsive up to 480px max-width centered.

## Components
- `OrderButton.jsx` — pill CTA with spring animation, loading state
- `StatusPanel.jsx` — frosted glass tracking panel, drone bob animation, ETA countdown
- `SoldOut.jsx` — sold out / unavailable state screen

## Notes
- No navigation. No back button. One flow.
- Google Fonts: Playfair Display + DM Sans (matches colors_and_type.css)
- All assets referenced from ../../assets/
