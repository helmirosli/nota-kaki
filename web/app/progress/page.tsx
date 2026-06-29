"use client"

import { motion } from "framer-motion"
import { useProgressStore } from "@/store/progress"
import { SUBJECTS } from "@/lib/types"

export default function ProgressPage() {
  const { noteProgress, getTotalStars } = useProgressStore()
  const totalStars = getTotalStars()
  const completedNotes = Object.values(noteProgress).filter((p) => p.completed).length

  return (
    <div className="min-h-screen px-6 py-8 max-w-2xl mx-auto">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="text-7xl mb-4"
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
        >
          🏆
        </motion.div>
        <h1 className="text-4xl font-black text-amber-700">Kemajuan Kamu</h1>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div
          className="bg-yellow-400 rounded-2xl p-6 text-center shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
        >
          <div className="text-4xl font-black text-yellow-900">{totalStars}</div>
          <div className="text-yellow-800 font-bold mt-1">⭐ Bintang</div>
        </motion.div>
        <motion.div
          className="bg-green-400 rounded-2xl p-6 text-center shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <div className="text-4xl font-black text-green-900">{completedNotes}</div>
          <div className="text-green-800 font-bold mt-1">✅ Bab Selesai</div>
        </motion.div>
      </div>

      {/* Completed notes */}
      {completedNotes === 0 ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl font-bold text-amber-700">Belum ada nota selesai lagi</p>
          <p className="text-amber-500 mt-2">Pergi baca nota dan buat kuiz!</p>
        </motion.div>
      ) : (
        <div>
          <h2 className="text-xl font-black text-gray-700 mb-4">Nota Selesai</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(noteProgress)
              .filter(([, p]) => p.completed)
              .map(([noteId, progress], i) => {
                const parts = noteId.split("-")
                const subject = SUBJECTS.find((s) => noteId.includes(s.id))
                return (
                  <motion.div
                    key={noteId}
                    className="bg-white rounded-2xl p-4 shadow-md flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="text-3xl">{subject?.emoji ?? "📖"}</span>
                    <div className="flex-1">
                      <div className="font-black text-gray-800 text-sm">{noteId}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {progress.completedAt
                          ? new Date(progress.completedAt).toLocaleDateString("ms-MY")
                          : ""}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((s) => (
                        <span key={s} className={s <= progress.stars ? "opacity-100" : "opacity-20"}>⭐</span>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
