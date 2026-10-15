# Developer Notebook

A small, polished, desktop-first personal engineering notebook. Built with **Next.js App Router**, **React**, **TypeScript**, and plain CSS. Its visual direction is based on the owner's dark portfolio with warm beige accents.

## Features in v0.1

- Searchable **Knowledge Library** with category filters.
- **Build Journal** entries explaining objectives, decisions, agent assistance, verification, and lessons.
- Detail pages with **Bubble references**, code snippets, and three review questions.
- Local writer mode: create, edit, and delete entries with browser `localStorage` persistence.
- Export all entries to JSON to publish them through source control.
- Public reading mode, suitable for a portfolio deployment.
- Deep-link to a note using `#note=entry-id`.
- Responsive layout and semantic HTML; no external component library is required.

## Getting started

1. Install Node.js version 20.9 or later (`node --version`).
2. Unzip/open this folder in Cursor or VS Code.
3. In the integrated terminal:

   ```bash
   npm install
   cp .env.local.example .env.local
   npm run dev
   ```

4. Open <http://localhost:3000>.
5. Try searching for `state`, opening **React State**, switching to **Build Journal**, and creating a test note.

> `.env.local` enables authoring on your local computer. If you change `.env.local`, restart the dev server. If Node.js is not installed, get the LTS release from <https://nodejs.org/>.

## What is stored where?

| Item | Location | Bubble analogy |
|---|---|---|
| UI structure | `src/components/*.tsx` | Reusable elements |
| Visual styling | `src/app/globals.css` | Element styles / design system |
| Content structure | `src/lib/types.ts` | Data types and option sets |
| Published content | `src/data/entries.json` | Seeded application records |
| Local draft changes | Your browser's `localStorage` | Temporary local-only persistence (not Bubble DB) |
| Home page | `src/app/page.tsx` | Index page |
| Shared page wrapper | `src/app/layout.tsx` | Shared application shell |

### Important distinction: drafts vs published content

The editor **does not publish to a server or synchronize between devices**. It saves the current notebook to local storage **in that particular browser**, and exporting downloads an `entries.json` file.

To publish your writing:

1. In local writer mode, select **Export**.
2. Replace `src/data/entries.json` with the downloaded file.
3. Commit the changes to Git and redeploy the site.

In a public deployment, **do not** set `NEXT_PUBLIC_AUTHORING_MODE=true`. Without that flag, the editor is hidden and the public site shows only published JSON content. The flag is **not authentication**, and must not be considered a security boundary. Real multi-device private editing will require authentication, a database, and authorization policies in a later version.

**Privacy:** Everything in `src/data/entries.json` is public in a deployment. Don't store secrets or private journal entries in that file. Local drafts are not a secure vault either.

## How to use this as a learning exercise

Instead of asking an agent to rewrite the entire app, try these small changes:

1. Change `--accent` in `globals.css` and see how a CSS variable affects multiple components.
2. Add a new Knowledge Entry category to `src/lib/types.ts` and `EntryEditor.tsx` and its card abbreviation in `NotebookApp.tsx`.
3. Explain why `Entry` is a TypeScript union of two different entry types.
4. Add one real entry after a completed development session.
5. Use `npm run typecheck` and `npm run build` to verify changes.

At the end of each session, answer three reflection questions:

1. **What did I decide or implement myself?**
2. **What can I now explain without reading the agent's answer?**
3. **What would I change or investigate next time?**

## Suggested next steps

- Make the application run locally and inspect its structure (Session 1).
- Make one small layout edit with Cursor after reviewing the proposed diff (Session 2).
- Set up a GitHub repository and commit the source code.
- Add authentication + database storage only when the local-only editor becomes limiting.
- Deploy a public reading version with real, non-sensitive content.

## Tooling

- `npm run dev` — development server with hot reload.
- `npm run typecheck` — TypeScript validation.
- `npm run build` — production build.
- `npm run start` — serve a completed production build.

Initial source generated with ChatGPT for guided learning. Read every change and test it yourself: generated code is a starting point, not proof of correctness.

For a guided first session, see [`docs/SESSION-01.md`](docs/SESSION-01.md).

Run `npm run check:content` to verify the published note file contains well-formed entries and unique IDs.
