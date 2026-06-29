"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Source, Year, Subject, SUBJECTS } from "@/lib/types"
import { useProgressStore } from "@/store/progress"

const YEAR_LABELS: Record<string, string> = {
  "tahun-1": "Tahun 1", "tahun-2": "Tahun 2", "tahun-3": "Tahun 3",
  "tahun-4": "Tahun 4", "tahun-5": "Tahun 5", "tahun-6": "Tahun 6",
}

export function SubjectGrid({
  source,
  year,
  subjects,
  noteIdsBySubject = {},
}: {
  source: Source
  year: Year
  subjects: Subject[]
  noteIdsBySubject?: Record<string, string[]>
}) {
  return (
    <div className="min-h-screen px-6 py-8">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-5xl mb-3">📚</div>
        <h1 className="text-4xl font-black text-amber-700">{YEAR_LABELS[year]}</h1>
        <p className="text-lg text-amber-600 font-semibold mt-2">Pilih subjek!</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 max-w-2xl mx-auto">
        {subjects.map((subjectId, i) => {
          const meta = SUBJECTS.find((s) => s.id === subjectId)!
          return (
            <SubjectCard
              key={subjectId}
              source={source}
              year={year}
              meta={meta}
              index={i}
              noteIds={noteIdsBySubject[subjectId] ?? []}
            />
          )
        })}
      </div>
    </div>
  )
}

function SubjectCard({
  source,
  year,
  meta,
  index,
  noteIds,
}: {
  source: Source
  year: Year
  meta: (typeof SUBJECTS)[0]
  index: number
  noteIds: string[]
}) {
  const isNoteCompleted = useProgressStore((s) => s.isNoteCompleted)
  const getNoteStars = useProgressStore((s) => s.getNoteStars)

  const totalNotes = noteIds.length
  const completedCount = noteIds.filter((id) => isNoteCompleted(id)).length
  const totalStars = noteIds.reduce((sum, id) => sum + getNoteStars(id), 0)
  const allDone = totalNotes > 0 && completedCount === totalNotes

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 260, damping: 22 }}
    >
      <Link href={`/${source}/${year}/${meta.id}`}>
        <motion.div
          className="rounded-2xl p-5 flex flex-col items-center gap-2 shadow-lg cursor-pointer border-2 relative"
          style={{
            backgroundColor: meta.colour + "22",
            borderColor: allDone ? meta.colour : meta.colour + "55",
          }}
          whileHover={{ scale: 1.06, y: -6, borderColor: meta.colour }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {allDone && (
            <div
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black"
              style={{ backgroundColor: meta.colour }}
            >
              ✓
            </div>
          )}
          <span className="text-5xl">{meta.emoji}</span>
          <span className="text-base font-black text-center" style={{ color: meta.colour }}>
            {meta.label}
          </span>
          {totalNotes > 0 && (
            <div className="flex flex-col items-center gap-1 mt-1">
              <div className="text-xs font-bold" style={{ color: meta.colour + "bb" }}>
                {completedCount}/{totalNotes} bab
              </div>
              {totalStars > 0 && (
                <div className="text-xs text-amber-500 font-bold">⭐ {totalStars}</div>
              )}
            </div>
          )}
        </motion.div>
      </Link>
    </motion.div>
  )
}
