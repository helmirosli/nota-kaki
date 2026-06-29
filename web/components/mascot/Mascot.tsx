"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useProgressStore } from "@/store/progress"

const MOOD_EXPRESSIONS: Record<string, string> = {
  idle: "🌙",
  happy: "😊🌙",
  thinking: "🤔",
  celebrating: "🎉🌟",
}

const MOOD_MESSAGES: Record<string, string> = {
  idle: "Apa yang ingin kamu belajar hari ini?",
  happy: "Bagus! Teruskan!",
  thinking: "Cuba fikir baik-baik...",
  celebrating: "Tahniah! Kamu hebat! 🌟",
}

export function Mascot() {
  const mood = useProgressStore((s) => s.mascotMood)

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2 pointer-events-none"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {mood !== "idle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-amber-200 text-sm font-bold text-amber-800 max-w-[180px] text-center"
          >
            {MOOD_MESSAGES[mood]}
            <div className="absolute bottom-[-8px] right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot body */}
      <motion.div
        className="text-5xl select-none"
        animate={{
          y: mood === "celebrating" ? [0, -20, 0, -15, 0] : [0, -8, 0],
          rotate: mood === "celebrating" ? [0, -10, 10, -5, 0] : 0,
        }}
        transition={{
          duration: mood === "celebrating" ? 0.6 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {MOOD_EXPRESSIONS[mood]}
      </motion.div>
    </motion.div>
  )
}
