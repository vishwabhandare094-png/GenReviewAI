# GenReviewAI — Frontend

A Next.js (App Router + TypeScript + Tailwind) frontend for the GenReviewAI FastAPI backend.

## Design system: "The Ticket"

The whole UI is built around one idea: a review is a small printed ticket — punched,
torn-edged, stamped. The customer-facing rating page reads like a receipt, the owner
dashboard reads like a ticket rail. Numbers use a monospace, tabular typeface (IBM Plex Mono)
the way a receipt printer would set them; headlines use Fraunces, a warm serif with a
little ink-stamp character; body copy is Work Sans.

Palette: warm paper cream, near-black ink, a paprika-red primary accent, sage green for
positive signals, plum for negative, amber for ratings/stars.

## Getting started

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL to your FastAPI server
npm run dev
```

Open http://localhost:3000.

- Customer flow: `http://localhost:3000/r/<restaurant_id>`
- Owner sign in: `http://localhost:3000/login`

## Structure

```
app/
  page.tsx                 marketing home page
  login/, register/        owner auth
  r/[restaurantId]/        the customer QR rating flow (no auth)
  (owner)/                 authenticated owner area, shared sidebar layout
    dashboard/
    analytics/
    tags/
    knowledge/
    qr/
    settings/
components/                shared UI primitives (StarRating, TicketCard, Sidebar, ...)
lib/api.ts                 typed fetch client for every backend endpoint
lib/types.ts                shared TypeScript types matching the backend schemas
```

## Notes

- Owner auth is a simple bearer token stored in `localStorage` (`gr_token`) — swap for
  httpOnly cookies + a proper session if you need production-grade auth.
- The customer flow assumes a default rating threshold of 4.0 (per the PRD), since the
  backend doesn't yet expose a public "get restaurant" endpoint. Once one exists, fetch
  the real per-restaurant threshold instead of the constant in `app/r/[restaurantId]/page.tsx`.
