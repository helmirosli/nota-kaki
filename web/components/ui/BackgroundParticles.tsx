"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

const EMOJIS = ["⭐", "🌙", "✨", "🌟", "💫", "🌸", "🎵", "📖"]

export function BackgroundParticles() {
  const [particles, setParticles] = useState<
    { id: number; emoji: string; x: number; y: number; size: number; duration: number; delay: number; amplitude: number }[]
  >([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        emoji: EMOJIS[i % EMOJIS.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 14 + Math.random() * 14,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 4,
        amplitude: 15 + Math.random() * 20,
      }))
    )
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute opacity-20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size }}
          animate={{ y: [-p.amplitude, p.amplitude, -p.amplitude] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  )
}
