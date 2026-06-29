# NOTA KAKI — Architecture Document

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        NOTA KAKI                            │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  PDF Files   │───▶│  AI Pipeline │───▶│  JSON Notes  │  │
│  │ (references/)│    │ (scripts/)   │    │ (src/data/)  │  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘  │
│                                                 │           │
│                                          ┌──────▼───────┐  │
│                                          │  Next.js App │  │
│                                          │  (src/app/)  │  │
│                                          └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

The system has two distinct phases:
1. **Build-time pipeline** — PDFs → AI → JSON (run once, or when new PDFs added)
2. **Runtime app** — Next.js serves the JSON notes as an animated web app

---

## Phase 1: PDF Processing Pipeline

```
PDF File
   │
   ▼
┌─────────────────────────────┐
│  extract-pdf.ts             │
│  (pdfjs-dist)               │
│  • Reads PDF page by page   │
│  • Outputs raw text chunks  │
└──────────────┬──────────────┘
               │  raw text[]
               ▼
┌─────────────────────────────┐
│  generate-notes.ts          │
│  (Claude claude-haiku-4-5)  │
│  • Sends text to Claude     │
│  • Prompt: "Convert this    │
│    Islamic textbook content │
│    into kid-friendly JSON   │
│    notes for age 7-12..."   │
│  • Receives structured JSON │
└──────────────┬──────────────┘
               │  NoteSchema[]
               ▼
┌─────────────────────────────┐
│  save-notes.ts              │
│  • Writes JSON files to     │
│    src/data/notes/          │
│  • Updates manifest.json    │
└─────────────────────────────┘
```

### Claude Prompt Strategy

```
System: You are a curriculum designer creating engaging notes 
for Muslim children aged 7-12 in Malaysia. You write in Bahasa 
Melayu. Notes must be simple, visual-friendly, and fun.

User: Here is content from [Subject] [Year] chapter [N]:
<text>...</text>

Convert this into a JSON note with:
- A catchy title
- 3-6 concept sections (each with emoji, heading, 2-3 sentence body)
- 4 quiz questions (multiple choice, age-appropriate)
- 5-8 knowledge graph nodes showing concept relationships
- A "fun fact" callout
- Key vocabulary list (max 5 words)
```

### Note JSON Schema

```typescript
interface Note {
  id: string                    // "jais-tahun1-akhlak-bab1"
  source: "jais"
  year: "tahun-1" | "tahun-2"
  subject: Subject
  chapter: number
  title: string
  emoji: string
  colour: string                // hex, unique per subject
  estimatedMinutes: number
  sections: Section[]
  quiz: QuizQuestion[]
  graph: KnowledgeGraph
  vocab: VocabItem[]
  funFact: string
}

type Section =
  | { type: "intro"; heading: string; body: string; lottie?: string }
  | { type: "concept-cards"; items: ConceptCard[] }
  | { type: "callout"; icon: string; text: string }
  | { type: "steps"; items: string[] }
  | { type: "image-text"; imageAlt: string; text: string }

interface KnowledgeGraph {
  nodes: { id: string; label: string; colour: string }[]
  edges: { from: string; to: string; label: string }[]
}
```

---

## Phase 2: Next.js App Architecture

### Routing Structure (App Router)

```
src/app/
├── layout.tsx                    ← Root layout (mascot, bg particles)
├── page.tsx                      ← /  → Dashboard
├── [source]/
│   └── page.tsx                  ← /jais → Year picker
│       [year]/
│       └── page.tsx              ← /jais/tahun-1 → Subject grid
│           [subject]/
│           └── page.tsx          ← /jais/tahun-1/akhlak → Chapter list
│               [noteId]/
│               └── page.tsx      ← /jais/tahun-1/akhlak/bab-1 → Note
└── progress/
    └── page.tsx                  ← /progress → Trophy room
```

### Component Tree

```
<RootLayout>
  <BackgroundParticles />      ← Framer Motion floating dots
  <Mascot />                   ← Lottie crescent character (persistent)
  <NavBar />

  // Dashboard /
  <DashboardPage>
    <SourceCard source="jais"> ← Framer Motion scale + float
      (click → navigate)
    </SourceCard>
  </DashboardPage>

  // Year level /jais
  <YearPage>
    <YearCard year="tahun-1" />
    <YearCard year="tahun-2" />
  </YearPage>

  // Subjects /jais/tahun-1
  <SubjectPage>
    <SubjectCard subject="akhlak" progress={60} />
    <SubjectCard subject="bahasa-arab" progress={20} />
    ...
  </SubjectPage>

  // Chapter list /jais/tahun-1/akhlak
  <ChapterListPage>
    <ChapterCard note={note} locked={false} stars={2} />
    ...
  </ChapterListPage>

  // Note reader /jais/tahun-1/akhlak/bab-1
  <NotePage>
    <NoteHero title emoji colour />
    <NoteSection />              ← scroll-reveal per section
    <ConceptCards />             ← flip-in animation
    <KnowledgeGraph />           ← React Flow interactive
    <VocabList />
    <FunFact />
    <QuizSection />              ← inline quiz
    <ChapterNav prev next />
  </NotePage>
</RootLayout>
```

---

## Animation Architecture

### Layer 1 — Page Transitions (Framer Motion)
```typescript
// Every page wrapped with:
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -30 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
```

### Layer 2 — Card Interactions (Framer Motion)
```typescript
<motion.div
  whileHover={{ scale: 1.05, y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
```

### Layer 3 — Scroll Reveals (Framer Motion whileInView)
```typescript
// Each note section:
<motion.div
  initial={{ opacity: 0, x: -40 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ delay: index * 0.1 }}
>
```

### Layer 4 — Background Particles
```typescript
// 20-30 floating particles, each with random:
// - position, size, opacity
// - animation: y oscillation, slow rotation
// Framer Motion keyframes loop
```

### Layer 5 — Lottie Illustrations
```
public/lottie/
├── mascot-idle.json       ← Crescent moon bobbing
├── mascot-happy.json      ← Mascot celebrates (quiz win)
├── mascot-thinking.json   ← Mascot thinks (quiz question)
├── star-sparkle.json      ← Star award animation
├── book-open.json         ← Chapter start animation
├── confetti.json          ← Quiz 3-star completion
└── subject/
    ├── akhlak.json
    ├── bahasa-arab.json
    ├── feqah.json
    ├── jawi.json
    ├── hafazan.json
    └── tauhid.json
```

### Layer 6 — Quiz Feedback Animations (React Spring)
```typescript
// Correct answer: spring bounce scale 1 → 1.3 → 1
// Wrong answer: shake x: 0 → -10 → 10 → -10 → 0
// Stars: stagger in left to right with spring
// Confetti: canvas-confetti burst from center
```

---

## State Management (Zustand)

```typescript
interface ProgressStore {
  // Per note: stars earned (0-3)
  noteProgress: Record<string, { stars: number; completed: boolean }>

  // Per subject: chapters completed / total
  subjectProgress: Record<string, { completed: number; total: number }>

  // Mascot state
  mascotMood: "idle" | "happy" | "thinking" | "celebrating"

  // Actions
  completeNote: (noteId: string, stars: number) => void
  setMascotMood: (mood: MascotMood) => void
}
```

Zustand middleware: `persist` → auto-saves to `localStorage`

---

## Subject Colour System

| Subject | Colour | Emoji |
|---------|--------|-------|
| Akhlak | `#4CAF50` (green) | 🌱 |
| Bahasa Arab | `#2196F3` (blue) | 📖 |
| Feqah | `#9C27B0` (purple) | 🕌 |
| Jawi | `#FF9800` (orange) | ✏️ |
| Hafazan | `#F44336` (red-gold) | 🎵 |
| Tauhid | `#FFD700` (gold) | ⭐ |

---

## Knowledge Graph (React Flow)

Each note has a mini graph at the bottom:
- Nodes rendered as coloured bubbles with emoji labels
- Edges as animated dashed lines (CSS animation)
- Tap node → tooltip with definition
- Auto-layout using `dagre` algorithm
- Pan + pinch zoom on mobile

```
Example: Akhlak Bab 1

   [Allah] ──── "ciptaan" ────▶ [Manusia]
      │                              │
   "perintah"                   "mesti ada"
      │                              │
      ▼                              ▼
  [Akhlak] ◀──── "contoh" ──── [Nabi Muhammad]
      │
  "jenis"
   /     \
[Baik] [Buruk]
```

---

## Data Flow Diagram

```
┌──────────────┐
│  User lands  │
│  /dashboard  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  manifest.json       │  ← static, generated at build time
│  { sources, years,   │
│    subjects, notes } │
└──────┬───────────────┘
       │ Next.js reads at build time (generateStaticParams)
       ▼
┌──────────────────────┐
│  Static pages        │  ← all routes pre-rendered
│  (fully static site) │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Zustand (runtime)   │  ← progress, stars, mascot mood
│  ↕ localStorage      │
└──────────────────────┘
```

**The app is fully static** — no server runtime needed. Once notes are generated, it deploys as a static Next.js export to Vercel (free tier) or any static host.

---

## Performance Considerations

| Concern | Solution |
|---------|----------|
| 12 PDFs, heavy processing | Run pipeline once offline, commit JSONs |
| Lottie files are large | Load lazily, use `dynamic()` import |
| React Flow can be slow | Load only when note section is visible |
| Mobile performance | `will-change: transform` on animated cards only |
| Font loading | Next.js `next/font` with Nunito |

---

## Security Notes

- No user data sent to any server (progress is localStorage only)
- Claude API key used only in build-time script (never in browser)
- No auth needed for MVP (family-local use)
- PDFs stay local, only extracted text sent to Claude API

---

## Content Scope & Growth Plan

### Current Sources
| Source | Years | Status |
|--------|-------|--------|
| JAIS | Tahun 1–2 | PDFs available |
| JAIS | Tahun 3–6 | PDFs added over time |
| KSSR | Tahun 1–6 | Planned (second phase) |

### Incremental Pipeline
The pipeline checks `src/data/notes/manifest.json` before processing.  
If a note JSON already exists for a PDF, it is **skipped** — only new PDFs are processed.

```bash
# First run — processes all PDFs
npx tsx scripts/run-pipeline.ts

# After adding new PDFs — only processes new ones
npx tsx scripts/run-pipeline.ts
```

The manifest tracks processed PDFs by file path + last-modified date, so re-running is always safe.

### Directory Convention for New Sources
```
references/
├── jais/
│   ├── tahun-1/
│   ├── tahun-2/
│   └── tahun-3/   ← drop PDF here, re-run pipeline
└── kssr/          ← new source, same structure
    ├── tahun-1/
    └── ...
```

---

## Text-to-Speech

Uses browser **Web Speech API** — no external library, no cost, works offline.

```typescript
const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = "ms-MY"   // Bahasa Melayu
  utterance.rate = 0.85       // slightly slower for kids
  window.speechSynthesis.speak(utterance)
}
```

---

## Future Extensions

| Feature | Complexity |
|---------|-----------|
| Arabic text (RTL sections) | Medium — add `dir="rtl"` per section |
| Offline PWA | Low — add next-pwa |
| Parent dashboard | Medium — view child progress |
| Jawi keyboard practice | High — custom canvas component |
| KSSR source | Low — add PDFs, re-run pipeline |
