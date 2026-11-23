# Scapia Itinerary

An AI trip planner concept for Scapia: answer a few questions and get three complete, budget-safe Thailand itineraries — or build your own, piece by piece.

## What it is / why I built it

Planning a multi-city trip means juggling flights, stays and experiences across tabs, with no single view of whether it all fits your budget or your travel style. This concept does the assembly for the user, starting from what a travel app can already know about them.

The planner merges a passive travel profile with a few active trip questions into an explicit, inspectable set of constraints (route, dates, budget ceiling, budget split, vibe). An LLM scores the demo inventory against those constraints, and a deterministic engine assembles three themed itineraries that never exceed the per-person budget — each with a one-line reason for every pick and the Scapia coins you'd earn.

> Independent concept prototype. Not affiliated with or endorsed by Scapia. All inventory, prices and users are mock data.

## Features

- **Travel profile + demo user switcher** — five mock travellers; switch between them to watch the personalisation change.
- **Trip onboarding** — cities (Bangkok, Chiang Mai, Phuket), dates, who's coming, trip vibe, and budget per person.
- **Trip plan summary** — route and city dates, merged preferences, a hard per-person budget ceiling and a personalised budget split.
- **AI Auto-Build** — three itineraries (*Your Best Match*, *Budget Smart*, *Premium Upgrade*) compared side by side, with a detail view showing flights, stays and experiences plus an AI reason for each pick, and a day-by-day view.
- **Manual Build** — pick flights, stays and experiences yourself, with a banner to jump to the AI picks at any point.
- **My Itineraries** — saved trips with coins earned; select any two to compare side by side.
- **Deterministic core** — the constraint engine and itinerary assembly involve no AI and no randomness; the LLM is only used once to score inventory.
- **Server-side key in production** — `/api/score` holds the OpenAI key, only scores the built-in demo inventory, and rejects requests from other origins.

## Tech stack

- React 19, React Router 7, Vite 8
- OpenAI `gpt-4o` (JSON mode) for inventory scoring
- Vercel serverless function (`api/score.js`) + SPA rewrites (`vercel.json`)

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the key(s)
npm run dev                  # Vite dev server
```

In `npm run dev`, the browser calls OpenAI directly using `VITE_OPENAI_API_KEY` from `.env.local` (local only). In production and under `vercel dev`, the app calls `/api/score`, which uses the server-side `OPENAI_API_KEY`.

Environment variables:

| Name | Where | Purpose |
|---|---|---|
| `VITE_OPENAI_API_KEY` | local dev only | Direct scoring from the browser during `npm run dev`. Never set this in Vercel. |
| `OPENAI_API_KEY` | Vercel / `vercel dev` | Server-side key for `/api/score` |
| `ALLOWED_ORIGIN` | optional | Comma-separated extra hosts allowed to call `/api/score` |

## Project structure

```
api/score.js              Serverless scoring endpoint (OpenAI, server-side)
src/
  screens/                TravelProfile, Onboarding, Summary, AutoBuild*, DayByDay,
                          Flights, Stays, Experiences, ItinerarySummary, MyItineraries
  engine/
    constraintEngine.js   Profile + answers -> explicit constraints and budget split
    scoringPrompt.js      Shared prompt + inventory formatter
    aiScoring.js          Scoring client (direct in dev, /api/score in prod)
    autoAssemble.js       Builds the 3 themed itineraries from scored inventory
  data/                   Mock inventory, users and images
  components/, store/     UI kit and app state
```

## Status

Working prototype, scoped to Thailand (Bangkok, Chiang Mai, Phuket) with mock inventory.
