# @waypoint-tours/vue

<p>
  <a href="https://www.npmjs.com/package/@waypoint-tours/vue"><img alt="npm" src="https://img.shields.io/npm/v/@waypoint-tours/vue?color=6d5cff&label=npm"></a>
  <img alt="Vue 3.3+" src="https://img.shields.io/badge/Vue-3.3%2B-42b883">
  <a href="../../LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-green"></a>
</p>

**Add guided product tours to your Vue 3 app.** Register a plugin once, then
start an interactive walkthrough — focus mask, animated cursor, tooltips — from
any component with a one-line composable.

Thin Vue binding over [`@waypoint-tours/runtime`](https://www.npmjs.com/package/@waypoint-tours/runtime).
Vue 3.3+.

🔗 **[Live demo](https://jupaorba.github.io/tour-skill/)**

---

## 📦 Install

```bash
npm install @waypoint-tours/vue @waypoint-tours/runtime
```

---

## 🚀 Use it

**1. Register the plugin** and import the styles once:

```ts
import { createApp } from 'vue';
import { createWaypointPlugin } from '@waypoint-tours/vue';
import '@waypoint-tours/runtime/styles.css';
import tours from '../tours/index.json'; // your tour files
import App from './App.vue';

const { install } = createWaypointPlugin({ tours, locale: 'en' });

createApp(App).use({ install }).mount('#app');
```

**2. Start a tour** from any component with `useTour()`:

```vue
<script setup>
import { useTour } from '@waypoint-tours/vue';
const { start } = useTour();
</script>

<template>
  <button @click="start('login')">How does it work?</button>
</template>
```

---

## 🧩 `useTour()` API

| Value | What it does |
|---|---|
| `start(tourId, { fromStep? })` | Start a tour by id. |
| `next()` / `prev()` | Step forward / back. |
| `abort()` | Stop the current tour. |
| `isRunning` | Reactive `ref` — `true` while a tour is playing. |
| `waypoint` | The underlying runtime instance, if you need `goTo`, `listTours`, etc. |

`createWaypointPlugin()` accepts the same options as the runtime (`tours`,
`locale`, `router`, `reducedMotion`, `demoMode`) and tears the tour down when
the root app unmounts. Need the instance outside a component? Use
`injectWaypoint()`.

---

## 🤖 Where do the tour files come from?

You don't write them by hand. The [`@waypoint-tours/cli`](https://www.npmjs.com/package/@waypoint-tours/cli)
lets an AI agent read your app and generate the `*.tour.json` files.

---

## 📄 License

MIT © Juan Pablo Ortiz Ballna
