# Note Schema

> The central type system for all note data. Every JSON file, component prop, and rendering decision flows through these types.

← [[Architecture]]

---

## Location

```
web/lib/types.ts   ← single source of truth for all types
```

---

## Top-Level Enums

```typescript
type Source  = "jais" | "kssr"
type Year    = "tahun-1" | "tahun-2" | "tahun-3" | "tahun-4" | "tahun-5" | "tahun-6"
type Subject = "akhlak" | "bahasa-arab" | "feqah" | "jawi" | "hafazan"
             | "tauhid" | "imlak" | "khat" | "sirah" | "tajwid"
```

**`SubjectMeta`** — display config for each subject:
```typescript
interface SubjectMeta { id: Subject; label: string; emoji: string; colour: string }
```

`SUBJECTS` array is exported and used by [[Services/Dashboard]] and [[Services/Note Reader]].

---

## Note Interface

```typescript
interface Note {
  id: string               // e.g. "jais-tahun-3-feqah-bab2"
  source: Source
  year: Year
  subject: Subject
  chapter: number
  title: string
  emoji: string
  colour: string           // hex, used for all subject-coloured UI elements
  estimatedMinutes: number
  sections: SectionType[]  // main content
  quiz: QuizQuestion[]     // see [[Services/Quiz]]
  graph: KnowledgeGraph    // see [[Services/Knowledge Graph]]
  vocab: VocabItem[]
  funFact: CardBody
}
```

---

## CardBody — The Core Union

Used in sections, callouts, funFact, and steps items.

```typescript
type CardBody = string | CardBodyList | CardBodyArabic | CardBodyPairs
```

Rendered by [[Services/Note Sections]] → `SmartBody` component.

### `string`
Plain Malay text. Renders as `<p>`. Legacy format — auto-detection regex tries to find Arabic pattern.

### `CardBodyList`
```typescript
{ type: "list"; intro?: string; items: string[]; outro?: string }
```
Numbered list. Each item gets a subject-coloured circle badge.

### `CardBodyArabic`
```typescript
{
  type: "arabic"
  instruction?: string   // text shown before the Arabic block
  arabic: string         // RTL text in coloured box — \n works (whitespace-pre-line)
  translation?: string   // shown below with 💬 prefix
  source?: string        // e.g. "Hadis Riwayat Bukhari"
  outro?: string
  more?: Array<{ instruction?, arabic, translation?, source? }>  // multiple blocks
}
```
**Use for:** doa, hadith, Quran verses, example sentences, conversation dialogs.

### `CardBodyPairs`
```typescript
{
  type: "pairs"
  intro?: string
  rows: Array<{ label?: string; arabic: string; meaning: string }>
  outro?: string
}
```
Renders as a 2–3 column table: `label` (coloured left chip) | Arabic RTL | Malay meaning. Alternating row colours.

**Use for:** vocab lists, number tables (201–300), month lists (Hijriah/Masihi), any structured word↔meaning data.

> **Rule:** Never use `CardBodyArabic` with `\n` separators for structured lists. `\n` collapses in HTML `<p>` tags. Use `pairs` instead.

---

## Section Types

```typescript
type SectionType = IntroSection | ConceptCardsSection | CalloutSection | StepsSection
```

### `IntroSection`
```typescript
{ type: "intro"; heading: string; body: CardBody }
```
Subject-coloured heading + body. Rendered as a white card.

### `ConceptCardsSection`
```typescript
{ type: "concept-cards"; items: Array<{ icon: string; title: string; body: CardBody }> }
```
2-column grid of cards. Each card: large emoji + title + SmartBody. Hover lifts card.

### `CalloutSection`
```typescript
{ type: "callout"; icon: string; text: CardBody }
```
Full-width coloured box. Icon on left, `text` on right. All `CardBody` types supported.

### `StepsSection`
```typescript
{ type: "steps"; heading: string; items: CardBody[] }
```
Numbered steps. Items can be plain strings or `{ type: "arabic" }` for embedded doa/verse.

---

## Other Types

### `QuizQuestion`
```typescript
{ q: string; options: string[]; answer: number }   // answer is 0-based index
```

### `KnowledgeGraph`
```typescript
{
  nodes: Array<{ id: string; label: string; colour: string }>
  edges: Array<{ id: string; source: string; target: string; label: string }>
}
```

### `VocabItem`
```typescript
{ word: string; meaning: string; emoji?: string }
```

---

## Subject Colours

| Subject | Colour | Notes |
|---------|--------|-------|
| akhlak | `#4CAF50` | green |
| bahasa-arab | `#1565C0` | dark blue (notes); `#2196F3` in SUBJECTS constant |
| feqah | `#9C27B0` | purple |
| hafazan | `#E91E63` | pink |
| tauhid | `#FFB300` | amber |
| sirah | `#FF6F00` | deep orange |
| jawi | `#FF9800` | orange |
| imlak | `#009688` | teal |
| khat | `#795548` | brown |
| tajwid | `#1A237E` | indigo |

---

## Consumed By

- [[Services/PDF Pipeline]] — Claude generates JSON matching this schema
- [[Services/Notes Loader]] — reads and validates files
- [[Services/Note Sections]] — renders CardBody, SectionType
- [[Services/Note Reader]] — uses Note, SubjectMeta, VocabItem
- [[Services/Quiz]] — uses QuizQuestion
- [[Services/Knowledge Graph]] — uses KnowledgeGraph
- [[Services/Progress Store]] — uses Note.id as key
