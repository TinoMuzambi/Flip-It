# Flip-It

A private, local-first flashcard desk for deliberate practice. Build a deck, search and edit cards, then run a shuffled study session and mark what needs another pass.

[Open Flip-It](https://flip-it-xi.vercel.app)

## Why this version

The original prototype required hosted authentication, a MySQL database, and a Redis rate limiter before someone could flip a card. Flip-It 2.0 keeps the useful idea while removing that operational surface:

- no account, cookies, analytics, database, or application secrets;
- cards persist in the browser with `localStorage`;
- validated JSON export/import makes decks portable;
- shuffled sessions provide simple recall feedback;
- every action works with a keyboard and respects reduced-motion preferences;
- the responsive interface is statically rendered by Next.js.

Browser storage is convenient, not a backup. Export a deck before clearing site data or changing devices.

## Features

- Create, edit, delete, tag, and search up to 200 cards.
- Study in a random order and reveal answers on demand.
- Record “I knew it” or “Review again” for an end-of-session summary.
- Export a human-readable JSON deck and safely import it later.
- Start with six developer-fundamentals cards that demonstrate the experience.
- Restrictive security headers, including CSP, HSTS, frame protection, and permissions policy.

## Local development

Flip-It requires Node.js 24 or newer. It has no environment variables or external services.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run check  # ESLint, strict TypeScript, and unit tests
npm run build  # production build
npm audit      # dependency audit
```

Tests cover deck validation, import limits, filtering, and non-mutating shuffle behaviour. GitHub Actions runs the complete check and production build for every pull request.

## Data format

Exports are versioned so future clients can migrate them deliberately:

```json
{
  "version": 1,
  "title": "Developer fundamentals",
  "cards": [
    {
      "id": "event-loop",
      "prompt": "What does the JavaScript event loop coordinate?",
      "answer": "It coordinates the call stack and queued work...",
      "tags": ["JavaScript", "runtime"],
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

Imports are limited to 1 MB and 200 cards. Required text, unique IDs, timestamps, field lengths, and tags are validated before existing browser data is replaced.

## Deployment

The app uses the standard Next.js build:

```bash
npm run build
npm start
```

Set the deployment runtime to Node.js 24. No environment variables are required. The legacy `DATABASE_URL`, Clerk, and Upstash variables from the first version should be removed from the hosting project after the new deployment is live and their credentials should be revoked at the providers.

## License

[MIT](./LICENSE) © Tino Muzambi
