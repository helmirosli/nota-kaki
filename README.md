# Nota Kaki 📚

Interactive study notes for kids aged 7–12 following the **JAIS** (Jabatan Agama Islam Selangor) Islamic education curriculum.

Each chapter from the textbook PDF becomes an animated web page with concept cards, quizzes, a knowledge graph, and vocabulary — all in Bahasa Melayu.

---

## What's Inside

| Year | Subjects | Chapters |
|------|----------|----------|
| Tahun 1 | Akhlak, Bahasa Arab, Feqah, Jawi, Hafazan, Tauhid | 33 bab |
| Tahun 2 | Akhlak, Bahasa Arab, Feqah, Jawi, Hafazan, Tauhid | 33 bab |

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 16.2.9 | App Router, SSR |
| React | 19.2.4 | UI |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | v4 | Styling |
| Framer Motion | latest | Animations |
| Zustand | 5 | Progress state (localStorage) |
| Web Speech API | browser | Read-aloud |

---

## Project Structure

```
nota-kaki/
├── references/jais/          ← Source PDFs (not committed, local only)
│   ├── tahun-1/
│   └── tahun-2/
├── web/                      ← Next.js application
│   ├── app/                  ← App Router pages
│   │   ├── page.tsx                        → /
│   │   ├── progress/page.tsx               → /progress
│   │   └── [source]/[year]/[subject]/
│   │       ├── page.tsx                    → /jais/tahun-1/akhlak
│   │       └── [noteId]/page.tsx           → /jais/tahun-1/akhlak/jais-tahun-1-akhlak-bab1
│   ├── components/
│   │   ├── dashboard/        ← SubjectGrid, ChapterList
│   │   ├── notes/            ← NoteReader, NoteSection, ReadAloudButton
│   │   ├── quiz/             ← QuizSection
│   │   ├── graph/            ← KnowledgeGraph
│   │   ├── mascot/           ← Mascot
│   │   └── ui/               ← NavBar, BackgroundParticles
│   ├── data/
│   │   ├── notes/            ← JSON content files (one per bab)
│   │   └── extracted/        ← Raw text extracted from PDFs
│   ├── lib/
│   │   ├── types.ts          ← All TypeScript types incl. CardBody schema
│   │   └── notes.ts          ← Server-side note loading functions
│   ├── store/progress.ts     ← Zustand progress store
│   └── scripts/              ← PDF → JSON pipeline
├── ARCHITECTURE.md           ← System design & type documentation
├── CONTENT_GUIDE.md          ← How to add new tahun content
└── PLAN.md                   ← Product vision & tech decisions
```

---

## Getting Started

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## Adding New Content (Tahun 3+)

Read `CONTENT_GUIDE.md` — it covers the complete workflow:
1. Add PDFs to `references/jais/tahun-3/`
2. Run the extraction script to get text
3. Create JSON note files in `web/data/notes/`
4. Register the new year in `web/lib/types.ts`

---

## Content JSON Format

Each bab is a single JSON file. The key type is `CardBody`:

```ts
// Plain text (no Arabic script)
CardBody = string

// Bulleted/numbered list
CardBody = { type: "list", intro?, items: string[], outro? }

// Quran ayat / hadith / doa (renders RTL in coloured box)
CardBody = {
  type: "arabic",
  instruction?,   // context before the Arabic
  arabic,         // the Arabic text
  translation?,   // Rumi translation
  source?,        // e.g. "Surah al-Baqarah: 2"
  outro?,         // closing text
  more?           // additional ayat/hadith in the same card
}
```

**Golden rule:** never mix Arabic script into a plain string — always use `{ type: "arabic" }`.

---

## URL Structure

```
/                                              → Home (source picker)
/jais                                          → Year picker
/jais/tahun-2                                  → Subject grid
/jais/tahun-2/feqah                            → Chapter list
/jais/tahun-2/feqah/jais-tahun-2-feqah-bab1   → Note reader
/progress                                      → Stars & progress
```

---

## Progress & Stars

Progress is stored in `localStorage` via Zustand. No account or server needed. Each quiz completion awards 1–3 stars; total stars shown in the NavBar.
