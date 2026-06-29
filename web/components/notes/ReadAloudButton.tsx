"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export function ReadAloudButton({ text, colour }: { text: string; colour: string }) {
  const [speaking, setSpeaking] = useState(false)

  const toggle = () => {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "ms-MY"
    utterance.rate = 0.85
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <motion.button
      className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-2"
      onClick={toggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {speaking ? (
        <>
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            🔊
          </motion.span>
          Berhenti
        </>
      ) : (
        <>🔊 Baca Kuat</>
      )}
    </motion.button>
  )
}
