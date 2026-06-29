# NOTA KAKI — Project Plan

> Interactive animated study notes for kids aged 7–12, powered by JAIS Islamic education PDFs.

*Last updated: 2026-06-29.*

---

## 1. Vision

Transform dry religious textbook PDFs into a **magical, animated learning experience** for kids. Each note feels like a storybook — colourful cards, bouncy animations, a friendly mascot, and mini-quizzes. Kids navigate like an explorer discovering treasure maps, not reading a textbook.

---

## 2. Content Scope

| Sumber | Tahun | Subjek | Status |
|--------|-------|--------|--------|
| JAIS | 1 | Akhlak, Bahasa Arab, Feqah, Jawi, Hafazan, Tauhid | ✅ Done (33 bab) |
| JAIS | 2 | Akhlak, Bahasa Arab, Feqah, Jawi, Hafazan, Tauhid | ✅ Done (33 bab) |
| JAIS | 3–6 | All 6 subjects | 🔜 Next |
| KSSR | 1–6 | All 6 subjects | 📋 Planned |

---

## 3. User Journey

```
/
 └── [JAIS] card
      ├── [Tahun 1] card
      │    ├── [Akhlak]      → chapter list → note reader
      │    ├── [Bahasa Arab] → chapter list → note reader
      │    ├── [Feqah]       → chapter list → note reader
      │    ├── [Jawi]        → chapter list → note reader
      │    ├── [Hafazan]     → chapter list → note reader
      │    └── [Tauhid]      → chapter list → note reader
      └── [Tahun 2] card
           └── (same subjects)
```

Each level has entrance animations:
- Home → floating cards flying in
- Subject grid → cards stagger in
- Note → scroll-reveal per section

---

## 4. Tech Stack (Actual — as of 2026-06-29)

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| **Next.js** | 16.2.9 (App Router) | Routing, SSR |
| **React** | 19.2.4 | UI |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | v4 | Styling |
| **Framer Motion** | latest | All animations — page transitions, card hover, scroll-reveal, particles |

### State
| Tool | Version | Purpose |
|------|---------|---------|
| **Zustand** | 5 | Progress tracking |
| **localStorage** | browser | Persist stars + completed notes |

### Features
| Tool | Purpose |
|------|---------|
| **Web Speech API** | Read-aloud per section (no library, free, works offline) |
| **Custom SVG graph** | Knowledge graph per note (no React Flow dependency) |

### PDF Pipeline
| Tool | Purpose |
|------|---------|
| **pdfjs-dist** | Extract raw text from PDF pages |
| **Claude claude-haiku-4-5** | Transform text → structured note JSON |
| **tsx** | Run TypeScript scripts directly |

### Dev
| Tool | Purpose |
|------|---------|
| **ESLint** | Lint |
| **Turbopack** | Fast HMR in dev |

---

## 5. Note Structure

Each PDF chapter → one JSON file in `web/data/notes/`. Full schema in `ARCHITECTURE.md`.

Quick reference:
```json
{
  "id": "jais-tahun-2-feqah-bab1",
  "source": "jais",
  "year": "tahun-2",
  "subject": "feqah",
  "chapter": 1,
  "title": "Tayammum — Bersuci dengan Tanah",
  "emoji": "🕌",
  "colour": "#9C27B0",
  "estimatedMinutes": 12,
  "sections": [...],
  "quiz": [...],
  "graph": { "nodes": [...], "edges": [...] },
  "vocab": [...],
  "funFact": { "type": "arabic", "arabic": "...", "translation": "..." }
}
```

The `body`, `text`, and `funFact` fields accept `CardBody` — a discriminated union:
- `string` — Malay text only (no Arabic script)
- `{ type: "list", items: [...] }` — bulleted/numbered list
- `{ type: "arabic", arabic, translation, ... }` — Quran ayat, hadith, doa (renders RTL)

---

## 6. Visual Design

- **Palette**: Warm amber/gold background, subject-specific accent colours
- **Typography**: Nunito (rounded, friendly, legible for kids)
- **Cards**: Large rounded corners, soft shadows, hover lift + scale
- **Mascot**: Animated crescent/star character (persistent across pages)
- **Background**: 20 floating emoji particles (Framer Motion, client-side only)
- **Arabic text**: Displayed in a coloured RTL box with translation below

---

## 7. Key Features

### Implemented ✅
- Animated dashboard with source/year/subject navigation
- Subject grid with progress tracking per subject
- Chapter list with star indicators
- Note reader: intro, concept cards, callout, steps sections
- CardBody discriminated union — proper RTL Arabic rendering
- Knowledge graph (custom SVG) per note
- Inline quiz with 1–3 star scoring
- Read-aloud button (Web Speech API, `ms-MY`)
- Progress page (total stars)
- NavBar with breadcrumbs
- Zustand persist — progress survives page refresh
- Hydration-safe particles and star counter

### Planned 🔜
- Offline PWA (next-pwa)
- Parent dashboard — view child's progress
- Tahun 3–6 content
- KSSR source
- Jawi keyboard practice (canvas component)

---

## 8. Folder Structure (Actual)

```
nota-kaki/
├── references/                ← PDFs (local only, gitignored)
│   └── jais/
│       ├── tahun-1/           ← 6 PDFs
│       └── tahun-2/           ← 6 PDFs
├── web/                       ← Next.js app
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── progress/page.tsx
│   │   └── [source]/[year]/[subject]/
│   │       ├── page.tsx
│   │       └── [noteId]/page.tsx
│   ├── components/
│   │   ├── dashboard/         ← SubjectGrid, ChapterList
│   │   ├── notes/             ← NoteReader, NoteSection, ReadAloudButton
│   │   ├── quiz/              ← QuizSection
│   │   ├── graph/             ← KnowledgeGraph
│   │   ├── mascot/            ← Mascot
│   │   └── ui/                ← NavBar, BackgroundParticles
│   ├── data/
│   │   ├── notes/             ← 66 JSON files (tahun 1+2)
│   │   └── extracted/         ← Raw text from PDFs
│   ├── lib/
│   │   ├── types.ts           ← CardBody, Note, Subject, Year types
│   │   └── notes.ts           ← getAllNotes, getNotesBySubject, getSubjectMeta
│   ├── scripts/               ← PDF pipeline
│   └── store/progress.ts      ← Zustand store
├── .gitignore
├── ARCHITECTURE.md            ← System design & type docs
├── CONTENT_GUIDE.md           ← How to add new bab/tahun
├── PLAN.md                    ← This file
└── README.md                  ← Project overview
```

---

## 9. Decisions Made

| Question | Decision |
|----------|----------|
| Language | Bahasa Melayu only |
| Auth | None — public local app |
| Tahun scope | Start with 1+2, expand to 3–6 incrementally |
| Audio | Web Speech API (free, offline) |
| Deploy | Local dev now; Vercel-ready (no server runtime needed) |
| PDF processing | Manual for image-based PDFs; pipeline for text-based |

---

## 10. How to Add Tahun 3

See `CONTENT_GUIDE.md` for the detailed workflow. The short version:

1. Add `"tahun-3"` to `Year` type in `web/lib/types.ts`
2. Add `"Tahun 3": "Tahun 3"` to `YEAR_LABELS` in `NavBar.tsx`
3. Create JSON files: `web/data/notes/jais-tahun-3-{subject}-bab{N}.json`
4. Navigate to `http://localhost/jais/tahun-3` — it works automatically

No routing changes needed. The `[year]` dynamic segment handles any year.
