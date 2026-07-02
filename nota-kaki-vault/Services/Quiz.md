# Quiz

> Interactive multiple-choice quiz at the end of each note. Tracks answers, scores stars, triggers mascot moods, and persists results to the progress store.

← [[Architecture]]

---

## Location

```
web/components/quiz/QuizSection.tsx    ← "use client"
```

---

## State Machine

```
[idle]
  ↓ click "Mula Kuiz"
[in-progress]
  ↓ select answer → 1000ms reveal delay
  ↓ advance to next question (AnimatePresence slide)
  ↓ (repeat for all questions)
[done]
  ↓ show result card
  ↓ click "Cuba Lagi" → reset to [idle]
```

---

## Quiz Flow (detailed)

1. **Start** — "Mula Kuiz" button. Sets `started = true`, resets `current = 0`, `answers = []`.

2. **Question display** — Shows one question at a time. 4 options as clickable buttons (A–D).

3. **Answer selection:**
   - Clicked option highlighted immediately
   - 1000ms delay (shows answer reveal)
   - Correct → button turns green; mascot → `"happy"`
   - Wrong → correct answer highlighted green, selected turns red; mascot → `"thinking"`
   - After delay → advance to next question (or finish)

4. **Question transitions** — `AnimatePresence` with slide-out-left / slide-in-right

5. **Result card:**
   - Calculates `score = correct / total`
   - Stars: `score === 1` → 3⭐ | `score >= 0.6` → 2⭐ | else → 1⭐
   - Emoji + congratulatory message based on stars
   - Calls `completeNote(noteId, stars)` → [[Services/Progress Store]]
   - Calls `setMascotMood("celebrating")` on 3 stars
   - Fires confetti (canvas-confetti) on 3 stars

6. **Retry** — "Cuba Lagi" button resets all state back to idle

---

## Star Scoring

| Score | Stars | Message |
|-------|-------|---------|
| 100% | ⭐⭐⭐ | "Luar Biasa! Kamu Genius!" |
| ≥ 60% | ⭐⭐ | "Bagus! Cuba lagi untuk 3 bintang!" |
| < 60% | ⭐ | "Tak Apa! Baca semula dan cuba lagi!" |

Stars are never downgraded — see [[Services/Progress Store]].

---

## Confetti

Uses `canvas-confetti` on 3-star result:

```typescript
confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
```

---

## Mascot Integration

| Event | Mascot Mood | Where set |
|-------|-------------|-----------|
| Correct answer | `"happy"` | QuizSection → [[Services/Progress Store]] `setMascotMood` |
| Wrong answer | `"thinking"` | QuizSection → [[Services/Progress Store]] `setMascotMood` |
| 3-star result | `"celebrating"` | QuizSection → [[Services/Progress Store]] `setMascotMood` |

[[Services/UI Shell]] Mascot reads mood from the store and plays the corresponding animation.

---

## Animations

- Option buttons: `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`
- Question transitions: `AnimatePresence` with `initial={{ x: 50, opacity: 0 }}` / `exit={{ x: -50, opacity: 0 }}`
- Result card: spring entrance

---

## Props

```typescript
<QuizSection
  noteId: string        // used to write to Progress Store
  questions: QuizQuestion[]
  colour: string        // subject colour for styling
/>
```

---

## Dependencies

- [[Services/Progress Store]] — `completeNote()`, `setMascotMood()`
- [[Services/Note Schema]] — `QuizQuestion`
- Framer Motion (AnimatePresence, transitions)
- canvas-confetti
- Called by [[Services/Note Reader]]
