"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useParams } from "next/navigation"

const YEARS = [
  { id: "tahun-1", label: "Tahun 1", emoji: "1️⃣", colour: "from-yellow-400 to-orange-400" },
  { id: "tahun-2", label: "Tahun 2", emoji: "2️⃣", colour: "from-pink-400 to-rose-500" },
  { id: "tahun-3", label: "Tahun 3", emoji: "3️⃣", colour: "from-purple-400 to-violet-500" },
  { id: "tahun-4", label: "Tahun 4", emoji: "4️⃣", colour: "from-blue-400 to-indigo-500" },
  { id: "tahun-5", label: "Tahun 5", emoji: "5️⃣", colour: "from-green-400 to-teal-500" },
  { id: "tahun-6", label: "Tahun 6", emoji: "6️⃣", colour: "from-red-400 to-pink-500" },
]

export default function SourcePage() {
  const { source } = useParams<{ source: string }>()
  const sourceLabel = source.toUpperCase()

  return (
    <div className="min-h-screen px-6 py-8">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-5xl mb-3">🕌</div>
        <h1 className="text-4xl font-black text-amber-700">{sourceLabel}</h1>
        <p className="text-lg text-amber-600 font-semibold mt-2">Pilih tahun kamu!</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
        {YEARS.map((year, i) => (
          <motion.div
            key={year.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 280, damping: 22 }}
          >
            <Link href={`/${source}/${year.id}`}>
              <motion.div
                className={`bg-linear-to-br ${year.colour} rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg cursor-pointer`}
                whileHover={{ scale: 1.07, y: -6 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="text-4xl">{year.emoji}</span>
                <span className="text-xl font-black text-white">{year.label}</span>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
