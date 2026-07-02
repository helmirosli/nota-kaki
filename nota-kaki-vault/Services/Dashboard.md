# Dashboard

> The subject grid and chapter list views — the two browsing layers between the year landing and individual notes.

← [[Architecture]]

---

## Location

```
web/components/dashboard/
├── SubjectGrid.tsx    ← /jais/tahun-3 view
└── ChapterList.tsx    ← /jais/tahun-3/feqah view
```

---

## SubjectGrid

**Route:** `/[source]/[year]`
**File:** `web/app/[source]/[year]/page.tsx` (server) → `SubjectGrid` (client)

### What it renders

A grid of subject cards — one per subject that has notes. Each card shows:

- Large emoji (from `SubjectMeta`)
- Subject label (e.g. "Bahasa Arab")
- Progress indicator: `X / Y bab` completed
- Star count: total stars earned across all chapters in that subject
- Full checkmark (✅) if every chapter is completed

### Interactions

- Hover: card lifts (Framer Motion `whileHover={{ y: -4 }}`)
- Click: navigates to `/[source]/[year]/[subject]`
- Staggered enter animation: cards fade in one by one

### Data sources

- **Server (page.tsx):** calls [[Services/Notes Loader]] `getAvailableSubjects()` and `getNotesBySubject()` to get `noteIdsBySubject`
- **Client (SubjectGrid):** reads [[Services/Progress Store]] `getNoteStars()` and `isNoteCompleted()` per note ID

### Fallback

If no notes exist for a year, all subjects from the `SUBJECTS` constant are shown as empty placeholders (0/0 bab, no stars).

---

## ChapterList

**Route:** `/[source]/[year]/[subject]`
**File:** `web/app/[source]/[year]/[subject]/page.tsx` (server) → `ChapterList` (client)

### What it renders

A vertical list of chapter cards — one per note (bab). Each card shows:

- Chapter emoji + number (`Bab 1`)
- Note title
- Estimated reading time (`⏱ 12 minit`)
- Stars earned (`⭐⭐⭐` or empty)
- Green left border + checkmark if completed

### Interactions

- Click anywhere on a chapter card → navigates to `/[source]/[year]/[subject]/[noteId]`
- Hover: subtle scale (Framer Motion `whileHover={{ scale: 1.02 }}`)
- Enter animation: staggered slide-in from left

### Data sources

- **Server (page.tsx):** calls [[Services/Notes Loader]] `getNotesBySubject()` → passes notes array as props
- **Client (ChapterList):** reads [[Services/Progress Store]] per note ID

---

## State Flow

```
page.tsx (server)
  getNotesBySubject() → [[Services/Notes Loader]]
        ↓ props (serialized JSON)
SubjectGrid / ChapterList (client)
  useProgressStore() → [[Services/Progress Store]]
        ↓ combined display
User sees: chapter list with live progress
```

---

## Dependencies

- [[Services/Notes Loader]] (server-side, passed as props)
- [[Services/Progress Store]] (client-side, read directly)
- [[Services/Note Schema]] — `Note`, `SubjectMeta`, `SUBJECTS`
- Framer Motion (stagger animations)
