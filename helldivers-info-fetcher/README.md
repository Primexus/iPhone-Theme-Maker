# Widgy + Helldivers 2

A local test environment for [Widgy](https://apps.apple.com/us/app/widgy-widgets-home-lock-watch/id1524540481)'s
custom-JavaScript text data source, plus a working script that turns it into
a Helldivers 2 info widget (current Major Order + latest dispatch).

## How Widgy's JavaScript data source works

On a text layer's **Data** tab, choosing "Javascript" gives you an editor and
a mode toggle with two options:

- **async** — your code is dropped into the body of a function Widgy makes
  `async` for you, so top-level `await fetch(...)` works. You never write
  `function main() { ... }` yourself — that's the "no main()" part.
- **script** — same idea, but the wrapper function is plain sync (no
  `await`). Fine for things that don't need a network call.

Whatever your code `return`s becomes the layer's text.

**Note:** this is reverse-engineered from Widgy's release notes and public
examples (I couldn't find an official spec for the exact JS contract). The
`runner.js` harness in this folder wraps your script the same way, but treat
the app itself as the source of truth — paste a one-liner like
`return "hello"` in both modes first if anything here doesn't match what you
see on-device, and adjust `runner.js` accordingly.

## Test harness

`runner.js` reads a script file as plain text (no imports/modules — Widgy
scripts are self-contained, so keep it that way), wraps it like Widgy would,
and runs it in a sandboxed context that only exposes what Widgy is known to
expose: `fetch`, `console`, `btoa`/`atob`.

```
node runner.js scripts/helldivers.js              # async mode (default)
node runner.js scripts/helldivers.js --mode script
```

or via the npm alias:

```
npm run test:helldivers
```

Once a script prints what you want, copy its contents into Widgy's editor
as-is.

### Individual scripts

Each script is a standalone Widgy body for one slice of Helldivers data:

- `scripts/major-order.js` for the current Major Order
- `scripts/planet-status.js` for planet status and player counts
- `scripts/news.js` for the latest dispatch/news item
- `scripts/campaigns.js` for active campaigns/frontlines

Run them with:

```
npm run test:major-order
npm run test:planet-status
npm run test:news
npm run test:campaigns
```

## Helldivers 2 API

Using the community API at [helldivers-2.github.io/api](https://helldivers-2.github.io/api/)
([source](https://github.com/helldivers-2/api)):

- Base URL: `https://api.helldivers2.dev`
- No auth required, but send `X-Super-Client` (your app/project name) and
  `X-Super-Contact` (an email or URL) — recommended now, becoming mandatory.
- Rate limit: 5 requests / 10 seconds without auth (`X-RateLimit-*` /
  `Retry-After` response headers tell you where you stand).
- Endpoints used here:
  - `GET /api/v1/assignments` — active Major Order(s): `title`, `briefing`,
    `tasks`, `progress`, `expiration`.
  - `GET /api/v1/dispatches` — news feed, newest first, HTML-ish tags like
    `<i=1>` in `message` (stripped by the script).
  - Also available: `/api/v1/war` (global stats), `/api/v1/planets`,
    `/api/v1/planets/{index}`, `/api/v1/planet-events`, `/api/v1/campaigns`.

`scripts/helldivers.js` is set up to fail soft: if the Major Order fetch
errors it falls back to a placeholder string instead of throwing, so the
widget never shows a Widgy error state just because the API rate-limited it.

The split scripts above use the Helldivers Training Manual API at
`https://helldiverstrainingmanual.com/api/v1` and are intentionally small so
each one can be pasted into a separate Widgy text layer.
