"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type MascotMood = "idle" | "happy" | "thinking" | "celebrating"

interface NoteProgress {
  stars: number
  completed: boolean
  completedAt?: string
}

interface ProgressStore {
  noteProgress: Record<string, NoteProgress>
  mascotMood: MascotMood

  completeNote: (noteId: string, stars: number) => void
  getNoteStars: (noteId: string) => number
  isNoteCompleted: (noteId: string) => boolean
  getSubjectStars: (noteIds: string[]) => number
  setMascotMood: (mood: MascotMood) => void
  getTotalStars: () => number
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      noteProgress: {},
      mascotMood: "idle",

      completeNote: (noteId, stars) => {
        const existing = get().noteProgress[noteId]
        if (existing && existing.stars >= stars) return
        set((state) => ({
          noteProgress: {
            ...state.noteProgress,
            [noteId]: { stars, completed: true, completedAt: new Date().toISOString() },
          },
        }))
      },

      getNoteStars: (noteId) => get().noteProgress[noteId]?.stars ?? 0,

      isNoteCompleted: (noteId) => get().noteProgress[noteId]?.completed ?? false,

      getSubjectStars: (noteIds) =>
        noteIds.reduce((sum, id) => sum + (get().noteProgress[id]?.stars ?? 0), 0),

      getTotalStars: () =>
        Object.values(get().noteProgress).reduce((sum, p) => sum + p.stars, 0),

      setMascotMood: (mood) => set({ mascotMood: mood }),
    }),
    { name: "nota-kaki-progress" }
  )
)
