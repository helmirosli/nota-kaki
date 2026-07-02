# Note Reader

> The main note display component. Orchestrates all content sections, vocab, fun fact, quiz, read-aloud, and chapter navigation for a single note.

← [[Architecture]]

---

## Location

```
web/components/notes/NoteReader.tsx    ← "use client"
web/components/notes/ReadAloudButton.tsx
```

---

## Route

`/[source]/[year]/[subject]/[noteId]`

Server page (`page.tsx`) loads the note via [[Services/Notes Loader]], then passes it to `<NoteReader>`.

---

## What It Renders (top to bottom)

### 1. Hero Banner
- Full-width coloured box (subject colour)
- Bouncing emoji (Framer Motion infinite float)
- Chapter number and title
- `⏱ N minit` badge
- Stars badge if already completed (from [[Services/Progress Store]])
- `<ReadAloudButton>` (Web Speech API)

### 2. Content Sections
Maps `note.sections` → `<NoteSection>` (each section rendered by [[Services/Note Sections]]).

### 3. Vocab Table
Renders `note.vocab` as a simple list: `Arabic word — Malay meaning`.

**Auto-emoji lookup:** `getVocabEmoji()` matches `vocab.meaning` (lowercase) against a built-in map of 80+ entries:
- Family: ibu → 👩, ayah → 👨, datuk → 👴
- Animals: kucing → 🐱, kuda → 🐎, unta → 🐪
- School: buku → 📚, pensil → ✏️, kerusi → 🪑
- Colors, body parts, food, fruits, places, sports, clothes, verbs...

Emoji shown in the vocab card next to the word.

### 4. Fun Fact (🌟 Tahukah Kamu?)
Renders `note.funFact` as a [[Services/Note Sections]] `CalloutContent` — supports all `CardBody` types.

### 5. Quiz
`<QuizSection>` — see [[Services/Quiz]].

### 6. Chapter Navigation
Previous / Next buttons linking to adjacent chapters in the same subject. Uses `getNotesBySubject()` results passed from server.

---

## Read Aloud

**File:** `ReadAloudButton.tsx`

- Uses browser `window.speechSynthesis` — no library
- Settings: `lang = "ms-MY"`, `rate = 0.85`
- Toggle: "🔊 Baca Kuat" ↔ "🔊 Berhenti"
- `fullText` built by concatenating all section heading + body strings
- Stops on unmount (navigating away)

---

## Vocab Emoji Map

Matching is a substring search on the Malay `meaning` field (lowercased). Longer strings checked first to avoid false positives ("bapa saudara" before "bapa").

```typescript
const VOCAB_EMOJI: Array<[string, string]> = [
  ["bapa saudara", "🧑"], ["ibu saudara", "👩"],
  ["kucing", "🐱"], ["kuda", "🐎"],
  ["televisyen", "📺"], ["peti sejuk", "❄️"],
  // 80+ entries...
]
```

---

## Data Flow

```
page.tsx (server)
  getNoteById(noteId)      ← [[Services/Notes Loader]]
  getNotesBySubject(...)   ← for prev/next
  getSubjectMeta(subject)  ← colours/emoji
        ↓ serialized props
NoteReader (client)
  useProgressStore()       ← [[Services/Progress Store]]
  renders:
    note.sections → [[Services/Note Sections]]
    note.quiz     → [[Services/Quiz]]
    note.graph    → [[Services/Knowledge Graph]] (currently hidden)
    note.vocab    → vocab table with auto-emoji
    note.funFact  → CalloutContent
```

---

## Dependencies

- [[Services/Note Sections]] — `NoteSection`, `CalloutContent`
- [[Services/Quiz]] — `QuizSection`
- [[Services/Knowledge Graph]] — `KnowledgeGraph` (imported but hidden from display)
- [[Services/Progress Store]] — stars and completion status
- [[Services/Note Schema]] — `Note`, `SubjectMeta`, `VocabItem`
- Framer Motion (hero animation, section reveals)
