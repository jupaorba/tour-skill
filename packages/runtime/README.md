# @waypoint-tours/runtime

<p>
  <a href="https://www.npmjs.com/package/@waypoint-tours/runtime"><img alt="npm" src="https://img.shields.io/npm/v/@waypoint-tours/runtime?color=6d5cff&label=npm"></a>
  <img alt="gzip size" src="https://img.shields.io/badge/gzip-~7%20KB-2f6fed">
  <img alt="dependencies" src="https://img.shields.io/badge/deps-1-green">
  <a href="../../LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-green"></a>
</p>

**The engine that draws guided tours on top of your web app.** Give it a tour
described in plain JSON and it paints a focus mask, moves an animated cursor,
and shows tooltips step by step — no CSS or overlay code on your side.

Framework-agnostic. Only one dependency (`@floating-ui/dom`). ~7 KB gzip.

🔗 **[Live demo](https://jupaorba.github.io/tour-skill/)**

> **Using React or Vue?** Reach for [`@waypoint-tours/react`](https://www.npmjs.com/package/@waypoint-tours/react)
> or [`@waypoint-tours/vue`](https://www.npmjs.com/package/@waypoint-tours/vue)
> instead — they wrap this runtime with a provider and a `useTour()` hook. Use
> this package directly only for vanilla JS or another framework.

---

## 📦 Install

```bash
npm install @waypoint-tours/runtime
```

---

## 🚀 Quick start

```ts
import { Waypoint } from '@waypoint-tours/runtime';
import '@waypoint-tours/runtime/styles.css';

const waypoint = new Waypoint({
  // A map of tourId → tour, or an async function that returns it.
  tours: {
    login: {
      id: 'login',
      title: 'How to sign in',
      steps: [
        { id: 'intro', type: 'modal', body: 'Let me show you how to sign in.' },
        {
          id: 'email',
          type: 'input',
          title: 'Your email',
          body: 'Type the email you signed up with.',
          anchor: { selector: '[data-tour="login.email"]', strategy: 'data-tour' },
          demoValue: 'person@example.com',
        },
      ],
    },
  },
  locale: 'en',
});

// Start it from a button, a link, anywhere:
document.querySelector('#help')?.addEventListener('click', () => {
  waypoint.start('login');
});
```

That's it — the runtime handles the mask, the cursor, positioning, keyboard
navigation, focus trapping, and cleanup.

---

## 🧩 API

One instance per app. Each `start()` builds and tears down its own tour so
listeners never pile up.

| Method | What it does |
|---|---|
| `new Waypoint(options)` | Create the instance. `options.tours` is the tour map (or an async loader); `options.locale`, `options.router`, `options.reducedMotion`, `options.demoMode` are optional. |
| `start(tourId, { fromStep? })` | Start a tour (optionally from a given step). |
| `next()` / `prev()` | Move one step forward / back. |
| `goTo(stepId)` | Jump to a specific step. |
| `abort()` | Stop the current tour. |
| `destroy()` | Tear everything down (call on unmount). |
| `listTours()` | Resolve and return every tour. |
| `isRunning` | `true` while a tour is playing. |

Also exported: router adapters (`createReactRouterAdapter`,
`createVueRouterAdapter`, `createNextAdapter`) for tours that cross routes,
`registerDict` / `getDict` for i18n, and `hasFinished` to check saved progress.

---

## 🤖 Where do the tour files come from?

You don't have to write them by hand. The [`@waypoint-tours/cli`](https://www.npmjs.com/package/@waypoint-tours/cli)
lets an AI agent read your app and generate the `*.tour.json` files for you.

---

## 📄 License

MIT © Juan Pablo Ortiz Ballna
