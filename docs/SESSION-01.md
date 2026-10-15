# Session 01 — Your first code-based application

**Goal:** Run Developer Notebook locally, understand the main files, and make one visible change.

**Estimated time:** 60–90 minutes (installation time varies).

## Checklist

- [ ] Open the extracted `developer-notebook` folder in Cursor.
- [ ] In the Cursor terminal, run `node --version` and `npm --version`.
- [ ] Run `npm install` (downloads project dependencies).
- [ ] Run `cp .env.local.example .env.local` (enables local authoring mode).
- [ ] Run `npm run dev` and visit <http://localhost:3000>.
- [ ] Open the React State entry, search for “bubble,” and switch to Build Journal.
- [ ] Create a temporary Knowledge Entry; refresh and verify it remains in the same browser.
- [ ] Change `--accent` in `src/app/globals.css`; see the visual change in the browser.
- [ ] Run `npm run check:content`.
- [ ] Record your first real Build Journal entry.

## Concepts (in the order you'll encounter them)

1. **Node.js** runs JavaScript tools on your computer. This is how your Next.js development server starts.
2. **npm** installs dependencies described in `package.json`. Think of a package as a reusable code library, not necessarily a visual Bubble plugin.
3. **Next.js** organizes the application: `page.tsx` describes its root route, `layout.tsx` provides the common wrapper.
4. **React components** are UI building blocks, conceptually similar to Bubble reusable elements.
5. **TypeScript** checks that your data and function contracts are consistent; compare with Bubble field and option-set types.
6. **CSS variables** such as `--accent` set reusable design values, like a style token in Figma or Bubble.
7. **localStorage** stores data in the same browser on one device. It is not a shared database, account system, or secure private storage.

## Your first Cursor learning prompt

> Inspect this Next.js + TypeScript repository without modifying any files. Explain how `src/app/page.tsx`, `src/components/NotebookApp.tsx`, `src/lib/types.ts`, `src/data/entries.json`, and `src/app/globals.css` work together. Compare important ideas to Bubble. Draw the data flow from a knowledge entry stored in JSON to the card the user sees. Then ask me one question to check my understanding.

## Your small coding task

After inspecting the code, find the `--accent` CSS variable in `globals.css`. Change it from its current warm beige value to a slightly lighter shade, save, and watch the browser update automatically. This teaches you where styling lives without requiring you to understand React immediately.

## Three reflection questions for your journal

1. **What did I do or decide myself?**
2. **Which new idea can I now explain in my own words?**
3. **What was confusing, and what will I try next?**

When you finish, come back to ChatGPT with your terminal output and answers. We'll review the actual results and plan the next tiny feature.
