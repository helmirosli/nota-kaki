# Notes Loader

> Server-side service that reads all JSON note files from disk, filters by source/year/subject, and provides sorted results to page components.

← [[Architecture]]

---

## Location

```
web/lib/notes.ts
```

---

## Role

The Notes Loader is the **bridge between the file system and the web app**. It runs exclusively on the server (uses Node `fs`) — never imported into client components. All page components are server components that call these functions and pass results as serialized props.

---

## API

```typescript
getAllNotes(): Note[]
```
Reads every `.json` file from `web/data/notes/`, parses, returns sorted by `chapter`. Used to build search indexes or full sitemaps.

```typescript
getNotesBySubject(source: Source, year: Year, subject: Subject): Note[]
```
Filters notes for a specific subject, sorted by chapter. Used by:
- `/[source]/[year]/page.tsx` → to count chapters per subject for [[Services/Dashboard]]
- `/[source]/[year]/[subject]/page.tsx` → to list chapters in [[Services/Dashboard]]
- `/[source]/[year]/[subject]/[noteId]/page.tsx` → to find prev/next notes for [[Services/Note Reader]]

```typescript
getNoteById(id: string): Note | null
```
Direct lookup by note ID. Used by the note page to load the specific note.

```typescript
getSubjectMeta(subject: Subject): SubjectMeta
```
Returns `{ id, label, emoji, colour }` for a subject from the `SUBJECTS` constant.

```typescript
getAvailableYears(source: Source): Year[]
```
Returns unique years that have at least one note for a source.

```typescript
getAvailableSubjects(source: Source, year: Year): Subject[]
```
Returns unique subjects with notes for a given source+year combo. Used by `/[year]/page.tsx` to know which subjects to show.

---

## How Auto-Discovery Works

```typescript
// Pseudocode
const files = fs.readdirSync("web/data/notes/")
  .filter(f => f.endsWith(".json"))
  .map(f => JSON.parse(fs.readFileSync(f, "utf-8")))
```

No index file needed. Adding a new JSON file to `web/data/notes/` is sufficient — it appears in the app on next build/request.

---

## Sorting

Notes are sorted by `chapter` (ascending integer). `bab1` always comes before `bab2`.

---

## Data Flow

```
web/data/notes/*.json   (136 files)
        ↓ fs.readdirSync (server-side only)
notes.ts functions
        ↓ serialized props
Server components (page.tsx files)
        ↓ props
[[Services/Dashboard]] — SubjectGrid, ChapterList
[[Services/Note Reader]] — NoteReader
```

---

## Dependencies

- Node.js `fs`, `path` (server-only)
- [[Services/Note Schema]] — `Note`, `Source`, `Year`, `Subject`, `SubjectMeta`, `SUBJECTS`

---

## Notes

- Never import this in client components (`"use client"` files) — will crash at runtime
- `getAvailableSubjects` drives which subject cards appear in SubjectGrid; if a subject has no notes, it won't appear unless the fallback to `SUBJECTS.map(s => s.id)` is triggered
