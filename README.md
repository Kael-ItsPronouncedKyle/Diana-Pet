# Diana's Companion App — V2

A Tamagotchi-style daily companion and wellness tracker built with love for Diana.

## What It Does

Diana's pet creature glows brighter every time she checks in — tracking her recovery, health, puppy training, and daily wellness. The more she shows up, the happier her pet gets. That's the whole soul of the app.

## Features

- **Animated pet creature** that reacts to check-in engagement (not health values)
- **Time-of-day routines** — morning, midday, and evening flows
- **Recovery tracking** — Three Circles check-in, DBT skill of the day, urge logger
- **Body tracking** — sleep, meds, energy/pain, water, sensory load
- **Puppy training** — Apollo & Artemis phase-based training tracker
- **Weekly history** — 7-day grid + pattern detection
- **Word of the Day** — gentle literacy support
- **Crisis toolkit** — always one tap away, every screen

## For Diana (iPhone)

1. Open the app URL in Safari
2. Tap the Share button → "Add to Home Screen"
3. It'll look and feel like a real app — no App Store needed

## For Development

```bash
npm install
npm run dev     # localhost:5173
npm run build   # builds to dist/
npm run preview # preview the build
```

## Deploy

Build and drag the `dist/` folder to [Netlify](https://app.netlify.com/drop) for a free URL.

## Tech Stack

- React 18 + Vite 5
- Progressive Web App (vite-plugin-pwa)
- localStorage for data persistence
- No external UI libraries — all styles inline
- Nunito font (Google Fonts)
