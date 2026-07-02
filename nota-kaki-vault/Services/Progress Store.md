# Progress Store

> Zustand store that tracks per-note completion and star ratings. Persists to localStorage — no backend required.

← [[Architecture]]

---

## Location

```
web/store/progress.ts
```

---

## State Shape

```typescript
interface ProgressStore {
  noteProgress: Record<string, NoteProgress>
  mascotMood: "idle" | "happy" | "thinking" | "celebrating"
}

interface NoteProgress {
  stars: 0 | 1 | 2 | 3
  completed: boolean
  completedAt?: string   // ISO 8601
}
```

`noteProgress` is keyed by note ID (e.g. `"jais-tahun-3-feqah-bab2"`).

---

## Actions

```typescript
completeNote(noteId: string, stars: 1 | 2 | 3): void
```
Records completion. **Never downgrades** — if a note was previously completed with 3 stars, replaying with 2 stars keeps 3. Only upgrades.

```typescript
getNoteStars(noteId: string): number      // 0 if not started
isNoteCompleted(noteId: string): boolean
getTotalStars(): number                   // sum across all completed notes
setMascotMood(mood: MascotMood): void    // drives [[Services/UI Shell]] mascot
```

---

## Persistence

- Middleware: `persist` from `zustand/middleware`
- Storage key: `"nota-kaki-progress"`
- Backend: browser `localStorage`
- Survives page reloads and browser restarts
- Lost on: clearing site data, private browsing sessions

```typescript
export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({ ... }),
    { name: "nota-kaki-progress" }
  )
)
```

---

## Hydration Guard

NavBar reads `getTotalStars()` for the stars badge. Since `localStorage` is only available client-side, NavBar uses a `mounted` state flag to avoid SSR/client mismatch:

```tsx
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return <span>⭐ ...</span>
```

---

## Who Reads It

| Component | What it reads |
|-----------|--------------|
| [[Services/UI Shell]] → NavBar | `getTotalStars()` for badge |
| [[Services/Dashboard]] → SubjectGrid | `getNoteStars(id)` per note for progress bars |
| [[Services/Dashboard]] → ChapterList | `isNoteCompleted(id)`, `getNoteStars(id)` per chapter |
| [[Services/Note Reader]] | `isNoteCompleted(id)`, `getNoteStars(id)` for hero badge |
| `/progress` page | `noteProgress` for full history list |

---

## Who Writes It

| Component | What it writes |
|-----------|---------------|
| [[Services/Quiz]] → QuizSection | `completeNote(noteId, stars)` on quiz completion |
| [[Services/Quiz]] → QuizSection | `setMascotMood("celebrating")` on 3-star result |

---

## Star Calculation (in Quiz)

| Score | Stars |
|-------|-------|
| 100% correct | ⭐⭐⭐ |
| ≥ 60% correct | ⭐⭐ |
| < 60% correct | ⭐ |

Stars are calculated in [[Services/Quiz]] and written here.
