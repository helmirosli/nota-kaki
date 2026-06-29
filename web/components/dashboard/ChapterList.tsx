"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Note, SubjectMeta } from "@/lib/types"
import { useProgressStore } from "@/store/progress"

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((s) => (
        <span key={s} className={`text-lg ${s <= count ? "opacity-100" : "opacity-20"}`}>⭐</span>
      ))}
    </div>
  )
}

export function ChapterList({
  notes,
  meta,
  source,
  year,
  subject,
}: {
  notes: Note[]
  meta: SubjectMeta
  source: string
  year: string
  subject: string
}) {
  const getNoteStars = useProgressStore((s) => s.getNoteStars)
  const isNoteCompleted = useProgressStore((s) => s.isNoteCompleted)

  return (
    <div className="min-h-screen px-6 py-8 max-w-2xl mx-auto">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-6xl mb-3">{meta.emoji}</div>
        <h1 className="text-4xl font-black" style={{ color: meta.colour }}>{meta.label}</h1>
        <p className="text-amber-600 font-semibold mt-1">{year.replace("-", " ")} • {source.toUpperCase()}</p>
      </motion.div>

      {notes.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-6xl mb-4">🔧</div>
          <p className="text-xl font-bold text-amber-700">Nota belum dijana lagi</p>
          <p className="text-amber-500 mt-2">Jalankan pipeline untuk jana nota daripada PDF.</p>
          <code className="block mt-4 bg-white rounded-xl px-4 py-3 text-sm text-gray-700 shadow">
            npx tsx scripts/run-pipeline.ts
          </code>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          {notes.map((note, i) => {
            const stars = getNoteStars(note.id)
            const done = isNoteCompleted(note.id)
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link href={`/${source}/${year}/${subject}/${note.id}`}>
                  <motion.div
                    className="bg-white rounded-2xl p-5 shadow-md flex items-center gap-4 border-2"
                    style={{ borderColor: done ? meta.colour : "#e5e7eb" }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                      style={{ backgroundColor: meta.colour + "22" }}
                    >
                      {note.emoji || meta.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-gray-800 truncate">Bab {note.chapter}: {note.title}</div>
                      <div className="text-sm text-gray-500 mt-0.5">⏱ {note.estimatedMinutes} minit</div>
                      <StarRow count={stars} />
                    </div>
                    {done && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black shrink-0"
                        style={{ backgroundColor: meta.colour }}
                      >
                        ✓
                      </div>
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
