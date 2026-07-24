# @waypoint-tours/react

<p>
  <a href="https://www.npmjs.com/package/@waypoint-tours/react"><img alt="npm" src="https://img.shields.io/npm/v/@waypoint-tours/react?color=6d5cff&label=npm"></a>
  <img alt="React 18+" src="https://img.shields.io/badge/React-18%2B-2f6fed">
  <a href="../../LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-green"></a>
</p>

**Add guided product tours to your React app.** Wrap your app once, then start
an interactive walkthrough — focus mask, animated cursor, tooltips — from any
button with a one-line hook.

Thin React binding over [`@waypoint-tours/runtime`](https://www.npmjs.com/package/@waypoint-tours/runtime).
React 18+.

🔗 **[Live demo](https://jupaorba.github.io/tour-skill/)**

---

## 📦 Install

```bash
npm install @waypoint-tours/react @waypoint-tours/runtime
```

---

## 🚀 Use it

**1. Wrap your app** with the provider and import the styles once:

```tsx
import { WaypointProvider } from '@waypoint-tours/react';
import '@waypoint-tours/runtime/styles.css';
import tours from '../tours/index.json'; // your tour files

<WaypointProvider tours={tours} locale="en">
  <App />
</WaypointProvider>;
```

**2. Start a tour** from anywhere with `useTour()`:

```tsx
import { useTour } from '@waypoint-tours/react';

function HelpButton() {
  const { start } = useTour();
  return <button onClick={() => start('login')}>How does it work?</button>;
}
```

---

## 🧩 `useTour()` API

Returns everything you need to drive a tour:

| Value | What it does |
|---|---|
| `start(tourId, { fromStep? })` | Start a tour by id. |
| `next()` / `prev()` | Step forward / back. |
| `abort()` | Stop the current tour. |
| `isRunning` | `true` while a tour is playing (re-renders on change). |
| `waypoint` | The underlying runtime instance, if you need `goTo`, `listTours`, etc. |

`<WaypointProvider>` accepts the same options as the runtime (`tours`,
`locale`, `router`, `reducedMotion`, `demoMode`) and cleans up automatically on
unmount.

---

## 🤖 Where do the tour files come from?

You don't write them by hand. The [`@waypoint-tours/cli`](https://www.npmjs.com/package/@waypoint-tours/cli)
lets an AI agent read your app and generate the `*.tour.json` files.

---

## 📄 License

MIT © Juan Pablo Ortiz Ballna
