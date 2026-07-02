# Note Sections

> Renders all `SectionType` variants and `CardBody` discriminated unions. The content rendering engine of the app.

← [[Architecture]]

---

## Location

```
web/components/notes/NoteSection.tsx    ← "use client"
```

---

## Component Tree

```
<NoteSection section={SectionType}>
  ├── <IntroSection>        (type: "intro")
  ├── <ConceptCardsSection> (type: "concept-cards")
  │     └── <SmartBody body={CardBody}>
  ├── <CalloutSection>      (type: "callout")
  │     └── <CalloutContent text={CardBody}>
  └── <StepsSection>        (type: "steps")
        └── <SmartBody body={CardBody}>  (per step)
```

---

## `NoteSection`

Entry point. Dispatches on `section.type`, wraps each in a Framer Motion slide-in (alternating left/right based on index).

---

## Section Renderers

### `IntroSection`
- White card, subject-coloured heading
- Body: `SmartBody`

### `ConceptCardsSection`
- 2-column responsive grid
- Each card: large emoji, bold title, `SmartBody`
- Framer Motion: staggered fade-in (`delay: i * 0.1`), hover lifts card by 4px

### `CalloutSection`
- Full-width box with subject colour background (`colour + "18"` opacity)
- `2px solid` coloured border
- Left: large emoji; Right: `CalloutContent`

### `StepsSection`
- White card, numbered items
- Each item: coloured circle number + content
- Items can be string OR `CardBodyArabic` (embedded doa/verse within a step)
- Framer Motion: staggered slide from left (`delay: i * 0.08`)

---

## `SmartBody`

The main `CardBody` dispatcher. Takes `body: CardBody` and renders the right UI.

### Plain `string`
1. Runs `detectArabicBody(body)` — regex checks for Arabic characters
2. If Arabic detected → re-enters as `CardBodyArabic` (legacy string support)
3. Otherwise → plain `<p className="text-gray-600 font-semibold">`

### `CardBodyPairs` (`type: "pairs"`)
- Optional `intro` text above
- Table div with rounded corners and border
- Each row: alternating white/gray-50 background
  - **Label column** (optional): coloured chip (`colour + "18"` bg, `colour` text), `w-10` fixed width
  - **Arabic column**: `flex-1`, RTL (`dir="rtl"`), coloured text, `text-right`, border-right
  - **Meaning column**: `flex-1`, gray text
- Optional `outro` in coloured pill at bottom

### `CardBodyList` (`type: "list"`)
- Optional `intro` text
- Numbered items with subject-coloured circle badges
- Optional `outro` in coloured pill

### `CardBodyArabic` (`type: "arabic"`)
- Optional `instruction` text above
- Coloured box (`colour + "18"` bg, `colour + "44"` border)
- Arabic text: `text-xl font-bold leading-loose whitespace-pre-line dir="rtl"` (preserves `\n` line breaks)
- 💬 `Maksud:` + translation below
- Source badge (right-aligned, gray pill)
- `outro` text after
- Supports `more[]` array — multiple blocks separated by dashed HR

---

## `CalloutContent`

Special renderer for callout `text` field. Same logic as `SmartBody` but no inner background box (the callout is already a coloured container). Delegates:

- `type: "list"` → `<CalloutList>` (same numbered style, no extra box)
- `type: "arabic"` → `<CalloutArabic>` (Arabic centered, no inner box, `whitespace-pre-line`)
- `type: "pairs"` → `<SmartBody>` (reuses pairs table directly)
- Plain string → tries `detectArabicBody`, else bold `<p>`

---

## `detectArabicBody` (legacy helper)

```typescript
function detectArabicBody(body: string): CardBodyArabic | null
```

Regex-based parser for old plain-string notes that contain Arabic. Tries to extract:
1. Source citation in trailing `(Hadis...)` parentheses
2. `— Maksud:` split for translation
3. Arabic Unicode block (`؀–ۿ`) as the Arabic content
4. Everything before Arabic as `instruction`

Returns `null` if no Arabic found or Arabic < 5 chars. Used as fallback only — all new notes use explicit `{ type: "arabic" }`.

---

## Key CSS Notes

| Class | Purpose |
|-------|---------|
| `whitespace-pre-line` | Preserves `\n` in Arabic strings |
| `dir="rtl"` | Right-to-left for Arabic spans |
| `text-right` | Aligns Arabic to right in pairs table |
| `colour + "18"` | 10% opacity tint of subject colour (hex trick) |
| `leading-loose` | Generous line height for Arabic script |

---

## Dependencies

- [[Services/Note Schema]] — `SectionType`, `CardBody`, `CardBodyList`, `CardBodyArabic`, `CardBodyPairs`
- Framer Motion (section enter animations, card hover)
- Called by [[Services/Note Reader]]
