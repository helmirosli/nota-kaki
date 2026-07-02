# UI Shell

> Root layout, persistent chrome, and ambient UI elements that wrap every page: NavBar, Mascot, and BackgroundParticles.

← [[Architecture]]

---

## Location

```
web/app/layout.tsx                           ← root layout (server component)
web/components/ui/NavBar.tsx                 ← breadcrumb navigation
web/components/mascot/Mascot.tsx             ← mood-driven character
web/components/ui/BackgroundParticles.tsx    ← floating emoji ambient layer
```

---

## `layout.tsx` — Root Layout

Server component that wraps every page. Renders:
1. `<BackgroundParticles />` — behind everything
2. `<NavBar />` — top of page
3. `{children}` — the page content
4. `<Mascot />` — bottom-right corner, above everything

Sets `<html lang="ms">` and loads the `Geist` font family.

---

## `NavBar.tsx`

**Client component.** Provides:

- **Breadcrumbs** — parsed from `usePathname()`:
  - `/jais/tahun-3/feqah/bab1` → `JAIS › Tahun 3 › Feqah`
  - Each segment is a clickable link to its route
- **Stars badge** — reads `getTotalStars()` from [[Services/Progress Store]]
  - Links to `/progress`
  - Hydration guard: renders `⭐ ...` until `mounted`

---

## `Mascot.tsx`

**Client component.** A mood-driven character in the bottom-right corner.

### Mood States

| Mood | Trigger | Visual |
|------|---------|--------|
| `idle` | Default | Gentle float animation |
| `happy` | Correct quiz answer | Bounce up |
| `thinking` | Wrong quiz answer | Side-to-side wobble |
| `celebrating` | 3-star quiz result | Spin + scale up |

### Speech Bubble
Context-aware messages based on current mood. Bubble auto-dismisses after a few seconds.

### How mood changes
[[Services/Quiz]] calls `setMascotMood()` from [[Services/Progress Store]]:
- Correct answer → `"happy"`
- Wrong answer → `"thinking"`
- 3-star result → `"celebrating"`

---

## `BackgroundParticles.tsx`

**Client component.** 20 floating emoji particles — `⭐ 🌙 ✨ 🌟 💫` — drifting across the background.

Each particle has randomized (generated in `useEffect` to avoid SSR mismatch):
- Initial X/Y position
- Size (0.5–1.5rem)
- Float duration (8–20s)
- Start delay (0–10s)
- Horizontal drift amplitude

Uses Framer Motion `animate` with `repeat: Infinity` and `ease: "easeInOut"`. Pure CSS — no JS at runtime after mount.

### Hydration Fix
Particles are generated inside `useEffect(() => { setParticles(generate()) }, [])` — not during SSR — so server HTML and client HTML match on hydration.

---

## Page-Level Layouts

Beyond the root layout, individual route groups have their own layouts:

- `/[source]/[year]/[subject]/[noteId]` — note page, no extra layout (just the root shell)

---

## Dependencies

- `usePathname` (next/navigation)
- `useProgressStore` ← [[Services/Progress Store]]
- Framer Motion (Mascot animations, particle floats)
