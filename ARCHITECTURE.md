# NOTA KAKI — Architecture Document

*Last updated: 2026-06-29. Reflects the live codebase.*

---

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        NOTA KAKI                             │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  PDF Files   │───▶│  AI Pipeline │───▶│  JSON Notes  │   │
│  │ (references/)│    │ (scripts/)   │    │ (data/notes/)│   │
│  └──────────────┘    └──────────────┘    └──────┬───────┘   │
│                                                 │            │
│                                          ┌──────▼───────┐   │
│                                          │  Next.js App │   │
│                                          │  (web/app/)  │   │
│                                          └──────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

Two distinct phases:
1. **Pipeline** — PDFs → text extraction → Claude AI → JSON (run once per bab)
2. **App** — Next.js 16 SSR serves the JSON notes as an animated web app

---

## Phase 1: PDF Processing Pipeline

```
web/scripts/
├── extract-only.ts      ← extracts raw text from PDF, saves to data/extracted/
├── extract-pdf.ts       ← pdfjs-dist wrapper
├── generate-notes.ts    ← sends text to Claude, returns structured JSON
└── run-pipeline.ts      ← orchestrates extract → generate → write JSON
```

```bash
cd web
npx tsx scripts/run-pipeline.ts
```

> Note: many JAIS PDFs are image-based (scanned). pdfjs yields < 1000 chars.
> In those cases, content is written manually using curriculum knowledge.

---

## Phase 2: Next.js App Architecture

### Stack

| Tool | Version | Role |
|------|---------|------|
| Next.js | 16.2.9 | App Router, SSR |
| React | 19.2.4 | UI |
| TypeScript | 5.x | Types |
| Tailwind CSS | v4 | Styling |
| Framer Motion | latest | All animations |
| Zustand | 5 | Client state + localStorage |
| Web Speech API | browser | Read-aloud (no library) |

### Routing Structure

```
web/app/
├── layout.tsx                          ← Root layout (NavBar, Mascot, BackgroundParticles)
├── page.tsx                            → /  (source picker)
├── progress/page.tsx                   → /progress
└── [source]/
    ├── page.tsx                        → /jais
    └── [year]/
        ├── page.tsx                    → /jais/tahun-2
        └── [subject]/
            ├── page.tsx                → /jais/tahun-2/feqah  (chapter list)
            └── [noteId]/
                └── page.tsx            → /jais/tahun-2/feqah/jais-tahun-2-feqah-bab1
```

**Important:** static route segments take priority over dynamic ones in App Router.
Do NOT create any folder under `app/` that shadows a valid source/year/subject name
(e.g. `app/jais/` would 404 all `/jais/...` routes).

### Component Tree

```
<RootLayout>
  <BackgroundParticles />    ← 20 floating emoji particles (client-only via useEffect)
  <NavBar />                 ← breadcrumbs + totalStars (mounted-guard for hydration)
  <Mascot />

  // /
  <HomePage>
    source cards → navigate to /jais
  </HomePage>

  // /jais/tahun-2
  <YearPage>
    <SubjectGrid notes={notes} />   ← "use client", framer-motion
  </YearPage>

  // /jais/tahun-2/feqah
  <SubjectPage>
    <ChapterList notes={notes} meta={meta} />   ← "use client"
  </SubjectPage>

  // /jais/tahun-2/feqah/jais-tahun-2-feqah-bab1
  <NotePage>
    <NoteReader note={note} />
      ├── <NoteSection />        ← renders each section type
      ├── <KnowledgeGraph />     ← custom SVG graph
      ├── <QuizSection />        ← inline quiz with stars
      └── <ReadAloudButton />    ← Web Speech API
  </NotePage>
</RootLayout>
```

---

## Type System

All types live in `web/lib/types.ts`.

### CardBody — Discriminated Union

The most important type. All `body`, `text`, and `funFact` fields use this.

```typescript
type CardBody = string | CardBodyList | CardBodyArabic

interface CardBodyList {
  type: "list"
  intro?: string      // optional sentence before the list
  items: string[]     // list items — plain Rumi text only, no Arabic script
  outro?: string      // optional sentence after the list
}

interface CardBodyArabic {
  type: "arabic"
  instruction?: string   // context before the Arabic box
  arabic: string         // Arabic/Jawi text — renders RTL in coloured box
  translation?: string   // Rumi translation shown below Arabic
  source?: string        // badge text, e.g. "Surah al-Baqarah: 2"
  outro?: string         // closing text after the source badge
  more?: Array<{         // additional ayat/hadith in the same card
    instruction?: string
    arabic: string
    translation?: string
    source?: string
  }>
}
```

**Golden rule:** never mix Arabic script (`ب`, `س`, etc.) into a plain `string`.
Always use `CardBodyArabic` for any content containing Arabic or Jawi script.

### Note Schema

```typescript
interface Note {
  id: string             // "jais-tahun-2-feqah-bab1"
  source: Source         // "jais"
  year: Year             // "tahun-1" | "tahun-2" | ...
  subject: Subject       // "akhlak" | "bahasa-arab" | "feqah" | "jawi" | "hafazan" | "tauhid"
  chapter: number
  title: string
  emoji: string
  colour: string         // hex — unique per subject (see below)
  estimatedMinutes: number
  sections: Section[]
  quiz: QuizQuestion[]
  graph: KnowledgeGraph
  vocab: VocabItem[]
  funFact: CardBody      // can be string, list, or arabic
}
```

### Section Types

```typescript
type Section =
  | { type: "intro"; heading: string; body: CardBody }
  | { type: "concept-cards"; items: ConceptCard[] }
  | { type: "callout"; icon: string; text: CardBody }
  | { type: "steps"; heading?: string; items: (string | CardBodyArabic)[] }

interface ConceptCard {
  icon: string
  title: string
  body: CardBody
}
```

### Knowledge Graph

```typescript
interface KnowledgeGraph {
  nodes: { id: string; label: string; colour: string }[]
  edges: { id: string; source: string; target: string; label: string }[]
  //                   ^^^^^^          ^^^^^^
  //               node id ref      node id ref   (NOT "from"/"to")
}
```

### Subject Colours

```typescript
const SUBJECTS: SubjectMeta[] = [
  { id: "akhlak",      label: "Akhlak",      emoji: "🌱", colour: "#4CAF50" },
  { id: "bahasa-arab", label: "Bahasa Arab",  emoji: "📖", colour: "#2196F3" },
  { id: "feqah",       label: "Feqah",        emoji: "🕌", colour: "#9C27B0" },
  { id: "jawi",        label: "Jawi",         emoji: "✏️",  colour: "#FF9800" },
  { id: "hafazan",     label: "Hafazan",      emoji: "🎵", colour: "#E91E63" },
  { id: "tauhid",      label: "Tauhid",       emoji: "⭐", colour: "#FFB300" },
]
```

---

## Server vs Client Boundary

| File | Directive | Notes |
|------|-----------|-------|
| `web/lib/notes.ts` | server (no directive) | Uses `fs`, `path` — Node only |
| `web/store/progress.ts` | `"use client"` | Zustand persist → localStorage |
| `web/components/dashboard/*` | `"use client"` | Framer Motion, Zustand |
| `web/components/ui/NavBar.tsx` | `"use client"` | usePathname, Zustand |
| `web/components/ui/BackgroundParticles.tsx` | `"use client"` | Math.random via useEffect |
| All `app/*/page.tsx` | server components | Fetch notes server-side, pass as props |

### Hydration Fixes Applied

**BackgroundParticles** — `Math.random()` must not run during SSR (different values → mismatch):
```tsx
const [particles, setParticles] = useState([])
useEffect(() => { setParticles(generateParticles()) }, [])
```

**NavBar totalStars** — Zustand reads localStorage on client only:
```tsx
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
const totalStars = mounted ? totalStarsRaw : 0
```

---

## State Management

```typescript
// web/store/progress.ts
interface ProgressStore {
  noteProgress: Record<string, { stars: number; completed: boolean }>
  completeNote: (noteId: string, stars: number) => void
  getNoteStars: (noteId: string) => number
  isNoteCompleted: (noteId: string) => boolean
  getTotalStars: () => number
}
// persisted to localStorage via Zustand persist middleware
```

---

## Data Flow

```
User navigates to /jais/tahun-2/feqah/jais-tahun-2-feqah-bab1
          │
          ▼
app/[source]/[year]/[subject]/[noteId]/page.tsx  (server component)
  getNoteById("jais-tahun-2-feqah-bab1")
    → reads web/data/notes/jais-tahun-2-feqah-bab1.json from disk
          │
          ▼
<NoteReader note={note} />  (client component, receives serialised props)
  renders sections, quiz, graph
          │
          ▼
QuizSection completes → useProgressStore.completeNote(id, stars)
  → saved to localStorage
```

---

## Content Scope

| Source | Years Available | Status |
|--------|----------------|--------|
| JAIS | Tahun 1 | 33 bab, all 6 subjects ✓ |
| JAIS | Tahun 2 | 33 bab, all 6 subjects ✓ |
| JAIS | Tahun 3–6 | PDFs to be added |
| KSSR | Tahun 1–6 | Planned |

### Adding Tahun 3

See `CONTENT_GUIDE.md` for the full workflow. Quick summary:
1. Add `"tahun-3"` to the `Year` union type in `web/lib/types.ts`
2. Add year label to `YEAR_LABELS` in `web/components/ui/NavBar.tsx`
3. Drop JSON files in `web/data/notes/` following the naming convention
4. No code changes needed — routing is fully dynamic

---

## Performance Notes

| Concern | Solution |
|---------|----------|
| PDFs are large (up to 45MB) | Gitignored — local only |
| `node_modules` | Gitignored |
| Math.random on server | Deferred to useEffect |
| Zustand localStorage on server | mounted-guard pattern |
| Static route shadow | No folders in app/ matching source/year/subject |
