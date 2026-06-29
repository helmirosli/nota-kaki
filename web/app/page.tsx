"use client"

import { motion } from "framer-motion"
import Link from "next/link"

const SOURCES = [
  {
    id: "jais",
    label: "JAIS",
    fullName: "Jabatan Agama Islam Selangor",
    emoji: "🕌",
    bg: "from-green-400 to-emerald-500",
    shadow: "shadow-green-300",
    available: true,
  },
  {
    id: "kssr",
    label: "KSSR",
    fullName: "Kurikulum Standard Sekolah Rendah",
    emoji: "📘",
    bg: "from-blue-400 to-cyan-500",
    shadow: "shadow-blue-300",
    available: false,
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="text-7xl mb-4"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🌟
        </motion.div>
        <h1 className="text-5xl font-black text-amber-700 mb-3">Nota Kaki</h1>
        <p className="text-xl text-amber-600 font-semibold">
          Pilih sumber belajar kamu! 📚
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-8 justify-center">
        {SOURCES.map((source, i) => (
          <motion.div
            key={source.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
          >
            {source.available ? (
              <Link href={`/${source.id}`}>
                <SourceCard source={source} />
              </Link>
            ) : (
              <div className="opacity-60 cursor-not-allowed">
                <SourceCard source={source} comingSoon />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SourceCard({
  source,
  comingSoon = false,
}: {
  source: (typeof SOURCES)[0]
  comingSoon?: boolean
}) {
  return (
    <motion.div
      className={`relative w-72 h-64 rounded-3xl bg-linear-to-br ${source.bg} shadow-xl ${source.shadow} p-8 flex flex-col items-center justify-center gap-4`}
      whileHover={!comingSoon ? { scale: 1.06, y: -8 } : {}}
      whileTap={!comingSoon ? { scale: 0.97 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {comingSoon && (
        <div className="absolute top-4 right-4 bg-white/80 text-xs font-bold text-gray-600 px-3 py-1 rounded-full">
          Segera!
        </div>
      )}
      <div className="text-6xl">{source.emoji}</div>
      <div className="text-center">
        <div className="text-4xl font-black text-white">{source.label}</div>
        <div className="text-white/80 text-sm font-semibold mt-1">{source.fullName}</div>
      </div>
    </motion.div>
  )
}
