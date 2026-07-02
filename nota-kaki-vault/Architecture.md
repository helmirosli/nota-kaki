# Nota Kaki — Architecture

> Interactive Islamic education study notes for kids aged 7–12. Built on JAIS curriculum PDFs, processed by an AI pipeline into structured JSON, then rendered as an animated Next.js web app.

---

## System Overview

```
PDF Sources (references/)
        ↓
[[Services/PDF Pipeline]] (scripts/)
        ↓
JSON Notes (web/data/notes/)
        ↓
[[Services/Notes Loader]] (lib/notes.ts)
        ↓
Next.js App Router (app/)
        ↓
[[Services/UI Shell]]  ←→  [[Services/Dashboard]]
                               ↓
                     [[Services/Note Reader]]
                      ↙         ↓         ↘
          [[Services/Quiz]]  [[Services/Note Sections]]  [[Services/Knowledge Graph]]
                    ↓
          [[Services/Progress Store]] → localStorage
```

---

## Two-Phase Architecture

### Phase 1 — Content Generation (offline)
1. Drop PDFs into `references/jais/tahun-N/`
2. Run `[[Services/PDF Pipeline]]` → extracts text, chunks by chapter, sends to Claude Haiku
3. Claude returns structured JSON following [[Services/Note Schema]]
4. Output written to `web/data/notes/{id}.json`, `manifest.json` updated

### Phase 2 — Web App (runtime, zero API calls)
1. Next.js server reads notes via `[[Services/Notes Loader]]` using `fs.readdirSync`
2. Pages are server components — pass serialized note JSON to client components
3. `[[Services/Note Reader]]` renders sections, vocab, fun fact, quiz, nav
4. `[[Services/Quiz]]` tracks answers; on completion writes to `[[Services/Progress Store]]`
5. `[[Services/Progress Store]]` persists to `localStorage` — no backend needed

---

## Routing Structure

```
/                          → Source picker (JAIS / KSSR)
/jais                      → Year picker (Tahun 1–6)
/jais/tahun-3              → [[Services/Dashboard]] — SubjectGrid
/jais/tahun-3/feqah        → [[Services/Dashboard]] — ChapterList
/jais/tahun-3/feqah/bab1   → [[Services/Note Reader]]
/progress                  → Stars & completed notes
```

All routes are file-based dynamic segments: `[source]/[year]/[subject]/[noteId]`.

---

## Content Coverage

| Source | Years | Subjects |
|--------|-------|---------|
| JAIS   | Tahun 1–3 (partial 3) | akhlak, bahasa-arab, feqah, hafazan, tauhid, sirah, tajwid, imlak, jawi, khat |
| KSSR   | — (planned) | — |

**136 notes** currently in `web/data/notes/` following the pattern `{source}-{year}-{subject}-bab{N}.json`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, SSR) |
| Language | TypeScript 5 strict mode |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion 12, React Spring 10 |
| State | Zustand 5 + localStorage persist |
| Knowledge Graph | xyflow/react 12 |
| PDF Extraction | pdfjs-dist 5 |
| AI Generation | Anthropic Claude Haiku (pipeline only) |
| Audio | Web Speech API (browser-native) |
| Confetti | canvas-confetti |

---

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **JSON notes, not Markdown** | Nested quiz/graph/vocab data; Claude generates it reliably |
| **No runtime API calls** | All notes pre-generated; fast, offline-capable, no API cost at serve time |
| **Server-side note loading** | Direct disk access in server components; safe from client manipulation |
| **`CardBody` discriminated union** | One type handles plain text, lists, Arabic verses, and vocab pairs — see [[Services/Note Schema]] |
| **Zustand + localStorage** | No backend; offline-capable; instant reads |
| **Web Speech API** | No extra library; works offline; `lang="ms-MY"`, rate 0.85 |
| **8000-char PDF chunks → 1 bab** | Balances detail vs. read time (~5–15 min per chapter) |

---

## Service Index

- [[Services/PDF Pipeline]] — PDF → text → Claude → JSON
- [[Services/Note Schema]] — CardBody union, Note interface, all types
- [[Services/Notes Loader]] — Server-side file reading, filtering, sorting
- [[Services/UI Shell]] — Root layout, NavBar, Mascot, BackgroundParticles
- [[Services/Dashboard]] — SubjectGrid and ChapterList
- [[Services/Note Reader]] — Main note rendering, vocab, fun fact, nav
- [[Services/Note Sections]] — SmartBody, section renderers, CardBody dispatch
- [[Services/Quiz]] — Quiz flow, star scoring, confetti, mascot moods
- [[Services/Knowledge Graph]] — xyflow/react node-edge graph per note
- [[Services/Progress Store]] — Zustand store, localStorage persistence
