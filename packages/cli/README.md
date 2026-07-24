# @waypoint-tours/cli

<p>
  <a href="https://www.npmjs.com/package/@waypoint-tours/cli"><img alt="npm" src="https://img.shields.io/npm/v/@waypoint-tours/cli?color=2f6fed&label=npm"></a>
  <img alt="agents" src="https://img.shields.io/badge/agents-Claude%20%C2%B7%20Cursor%20%C2%B7%20any-6d5cff">
  <img alt="frameworks" src="https://img.shields.io/badge/React%20%C2%B7%20Vue%20%C2%B7%20Next.js-informational">
  <a href="../../LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-green"></a>
</p>

**Turn your app into guided tours — with help from your AI agent.** `npx
waypoint` reads your codebase, tags the right elements, pulls your real design
colors, and checks every tour in a real browser before you ship it.

Works with Claude Code, Cursor, or any agent. React, Vue, and Next.js.

🔗 **[Live demo](https://jupaorba.github.io/tour-skill/)**

---

## 📦 Install

```bash
npm install -D @waypoint-tours/cli

npx waypoint init
```

`init` adds the runtime for your framework, creates a `tours/` folder, and
installs the Waypoint skill for your agent (`.claude/`, `.cursor/`, or
`AGENTS.md`). It never commits — you review the diff.

---

## 🧭 The flow

Your agent walks this pipeline. Each step is one command:

| Command | What it does |
|---|---|
| `npx waypoint discover` | Detects framework, router, styles, and forms; maps routes → files into `.tourmap.json`. |
| `npx waypoint anchor --view=<name>` | Injects `data-tour="..."` attributes into a view's interactive elements (safe, idempotent codemod). Use `--dry-run` to preview. |
| `npx waypoint tokens` | Extracts your app's real design tokens into `tours/theme.css` so tours match your look. |
| `npx waypoint verify [tourFile]` | Runs the app in a **real browser** (Playwright) and walks every step. `--all` for all tours, `--ci` to fail the build on errors. |
| `npx waypoint register` | Rebuilds `tours/index.json` from your `*.tour.json` files. |

The agent writes the `tours/<id>.tour.json` file itself between `tokens` and
`verify`.

**Helpers:** `waypoint prompt --view=<name>` generates a ready-to-paste prompt
asking an agent to build the tour for a view · `waypoint list` shows registered
tours (or `--views`) · `waypoint doctor` checks your environment (Node,
Playwright, view drift).

Add `--json` to any command for machine-readable output.

---

## 🎁 What you get

Plain JSON tour files that [`@waypoint-tours/runtime`](https://www.npmjs.com/package/@waypoint-tours/runtime)
(via the [React](https://www.npmjs.com/package/@waypoint-tours/react) or
[Vue](https://www.npmjs.com/package/@waypoint-tours/vue) binding) plays as an
interactive walkthrough — focus mask, animated cursor, tooltips.

---

## 📄 License

MIT © Juan Pablo Ortiz Ballna
