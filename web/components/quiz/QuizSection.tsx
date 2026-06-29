"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSpring, animated } from "@react-spring/web"
import { QuizQuestion } from "@/lib/types"
import { useProgressStore } from "@/store/progress"
import confetti from "canvas-confetti"

export function QuizSection({
  noteId,
  questions,
  colour,
}: {
  noteId: string
  questions: QuizQuestion[]
  colour: string
}) {
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [done, setDone] = useState(false)

  const completeNote = useProgressStore((s) => s.completeNote)
  const setMascotMood = useProgressStore((s) => s.setMascotMood)

  const q = questions[current]
  const correct = answers.filter(Boolean).length

  const handleAnswer = (optionIndex: number) => {
    if (selected !== null) return
    setSelected(optionIndex)
    const isCorrect = optionIndex === q.answer
    setMascotMood(isCorrect ? "happy" : "thinking")

    setTimeout(() => {
      const newAnswers = [...answers, isCorrect]
      setAnswers(newAnswers)

      if (current + 1 >= questions.length) {
        const totalCorrect = newAnswers.filter(Boolean).length
        const stars = totalCorrect === questions.length ? 3 : totalCorrect >= Math.ceil(questions.length * 0.6) ? 2 : 1
        completeNote(noteId, stars)
        setDone(true)
        setMascotMood("celebrating")
        if (stars === 3) {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
        }
      } else {
        setCurrent((c) => c + 1)
        setSelected(null)
      }
    }, 1000)
  }

  const restart = () => {
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setDone(false)
    setMascotMood("idle")
  }

  if (!started) {
    return (
      <motion.div
        className="bg-white rounded-2xl p-8 shadow-md text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-5xl mb-4">🧠</div>
        <h3 className="text-2xl font-black text-gray-800 mb-2">Uji Minda!</h3>
        <p className="text-gray-600 font-semibold mb-6">{questions.length} soalan • Boleh buat!</p>
        <motion.button
          className="text-white font-black px-8 py-3 rounded-2xl text-lg shadow-lg"
          style={{ backgroundColor: colour }}
          onClick={() => setStarted(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Mula Kuiz! 🚀
        </motion.button>
      </motion.div>
    )
  }

  if (done) {
    const stars = correct === questions.length ? 3 : correct >= Math.ceil(questions.length * 0.6) ? 2 : 1
    return (
      <motion.div
        className="bg-white rounded-2xl p-8 shadow-md text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ rotate: [0, -10, 10, -5, 0] }}
          transition={{ duration: 0.6 }}
        >
          {stars === 3 ? "🎉" : stars === 2 ? "😊" : "💪"}
        </motion.div>
        <h3 className="text-2xl font-black text-gray-800 mb-2">
          {stars === 3 ? "Luar Biasa!" : stars === 2 ? "Bagus!" : "Cuba Lagi!"}
        </h3>
        <p className="text-gray-600 font-semibold mb-4">
          {correct} daripada {questions.length} betul
        </p>
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <motion.span
              key={s}
              className="text-4xl"
              initial={{ scale: 0 }}
              animate={{ scale: s <= stars ? 1 : 0.4, opacity: s <= stars ? 1 : 0.2 }}
              transition={{ delay: s * 0.15, type: "spring", stiffness: 300 }}
            >
              ⭐
            </motion.span>
          ))}
        </div>
        <button
          className="text-gray-600 font-bold underline text-sm"
          onClick={restart}
        >
          Cuba Lagi
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-md"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-bold text-gray-500">{current + 1}/{questions.length}</span>
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full"
            style={{ backgroundColor: colour }}
            initial={{ width: 0 }}
            animate={{ width: `${((current) / questions.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-2xl">🧠</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-lg font-black text-gray-800 mb-5">{q.q}</p>
          <div className="grid grid-cols-1 gap-3">
            {q.options.map((option, i) => (
              <OptionButton
                key={i}
                option={option}
                index={i}
                selected={selected}
                correct={q.answer}
                colour={colour}
                onSelect={handleAnswer}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

function OptionButton({
  option, index, selected, correct, colour, onSelect,
}: {
  option: string
  index: number
  selected: number | null
  correct: number
  colour: string
  onSelect: (i: number) => void
}) {
  const isSelected = selected === index
  const isCorrect = index === correct
  const revealed = selected !== null

  let bg = "bg-gray-50 border-gray-200 text-gray-800"
  if (revealed && isCorrect) bg = "bg-green-100 border-green-400 text-green-800"
  else if (revealed && isSelected && !isCorrect) bg = "bg-red-100 border-red-400 text-red-800"

  return (
    <motion.button
      className={`w-full text-left px-4 py-3 rounded-xl font-bold border-2 transition-colors ${bg}`}
      onClick={() => onSelect(index)}
      disabled={revealed}
      animate={
        revealed && isSelected && !isCorrect
          ? { x: [0, -8, 8, -6, 6, 0] }
          : revealed && isCorrect && isSelected
          ? { scale: [1, 1.04, 1] }
          : {}
      }
      transition={{ duration: 0.4 }}
      whileHover={!revealed ? { scale: 1.02 } : {}}
      whileTap={!revealed ? { scale: 0.98 } : {}}
    >
      <span className="font-black mr-2">{["A", "B", "C", "D"][index]}.</span>
      {option}
      {revealed && isCorrect && " ✅"}
      {revealed && isSelected && !isCorrect && " ❌"}
    </motion.button>
  )
}
