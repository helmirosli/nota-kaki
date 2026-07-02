"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Note, SubjectMeta } from "@/lib/types"
import { NoteSection } from "./NoteSection"
import { QuizSection } from "../quiz/QuizSection"
import { KnowledgeGraph } from "../graph/KnowledgeGraph"
import { ReadAloudButton } from "./ReadAloudButton"
import { useProgressStore } from "@/store/progress"
import { VocabItem } from "@/lib/types"

// ─── Vocab emoji lookup ───────────────────────────────────────────────────────
// Matched against the meaning string (case-insensitive substring search).
// Longer entries first so "bapa saudara" beats "bapa".
const VOCAB_EMOJI: Array<[string, string]> = [
  // Family
  ["bapa saudara", "🧑"], ["ibu saudara", "👩"], ["datuk", "👴"], ["nenek", "👵"],
  ["abang", "👦"], ["kakak", "👧"], ["adik", "👶"], ["ibu", "👩"], ["ayah", "👨"],
  ["bapa", "👨"], ["anak", "👶"],
  // Animals
  ["itik", "🦆"], ["ayam", "🐔"], ["kucing", "🐱"], ["anjing", "🐕"],
  ["lembu", "🐄"], ["unta", "🐪"], ["kuda", "🐎"], ["ikan", "🐟"],
  ["burung", "🐦"], ["singa", "🦁"], ["harimau", "🐯"], ["gajah", "🐘"],
  ["monyet", "🐒"], ["kambing", "🐐"], ["ular", "🐍"], ["arnab", "🐰"],
  ["tikus", "🐭"], ["cicak", "🦎"],
  // School
  ["pensil", "✏️"], ["pensel", "✏️"], ["pen ", "🖊️"], ["buku nota", "📓"],
  ["buku", "📚"], ["sekolah", "🏫"], ["meja", "🪑"], ["kerusi", "🪑"],
  ["papan", "📋"], ["beg", "🎒"], ["pembaris", "📏"],
  // Colors
  ["merah jambu", "🌸"], ["merah", "🔴"], ["hijau", "🟢"], ["biru", "🔵"],
  ["kuning", "🟡"], ["putih", "⚪"], ["hitam", "⚫"], ["ungu", "🟣"],
  ["oren", "🟠"], ["coklat", "🟤"], ["abu-abu", "🩶"], ["kelabu", "🩶"],
  // Body parts
  ["rambut", "💇"], ["kepala", "🗣️"], ["mata", "👁️"], ["telinga", "👂"],
  ["hidung", "👃"], ["mulut", "👄"], ["gigi", "🦷"], ["tangan", "✋"],
  ["jari", "☝️"], ["kaki", "🦶"],
  // Food & drink
  ["air", "💧"], ["roti", "🍞"], ["nasi", "🍚"], ["susu", "🥛"],
  ["telur", "🥚"], ["gula", "🍬"], ["garam", "🧂"],
  // Fruits
  ["tembikai", "🍉"], ["pisang", "🍌"], ["mangga", "🥭"], ["anggur", "🍇"],
  ["epal", "🍎"], ["betik", "🍈"], ["durian", "🌵"],
  // Vegetables
  ["lobak", "🥕"], ["tomato", "🍅"], ["bawang", "🧅"], ["timun", "🥒"],
  ["bayam", "🥬"], ["kobis", "🥬"], ["terung", "🍆"],
  // Places
  ["masjid", "🕌"], ["surau", "🕌"], ["rumah", "🏠"], ["pasar", "🏪"],
  ["taman", "🌳"], ["hospital", "🏥"], ["bank", "🏦"],
  // Sports
  ["berenang", "🏊"], ["berlari", "🏃"], ["bola sepak", "⚽"], ["bola", "⚽"],
  ["badminton", "🏸"], ["ping pong", "🏓"],
  // Clothes
  ["kopiah", "🎩"], ["tudung", "🧕"], ["baju", "👕"], ["seluar", "👖"],
  ["kasut", "👟"], ["stokin", "🧦"], ["topi", "🧢"],
  // Days / time
  ["jumaat", "🕌"], ["ahad", "☀️"], ["isnin", "📅"], ["selasa", "📅"],
  ["rabu", "📅"], ["khamis", "📅"], ["sabtu", "📅"],
  ["pagi", "🌅"], ["petang", "🌆"], ["malam", "🌙"], ["tengah hari", "☀️"],
  ["jam", "🕐"], ["minit", "⏱️"],
  // Numbers
  ["sepuluh", "🔟"], ["sembilan", "9️⃣"], ["lapan", "8️⃣"], ["tujuh", "7️⃣"],
  ["enam", "6️⃣"], ["lima", "5️⃣"], ["empat", "4️⃣"], ["tiga", "3️⃣"],
  ["dua", "2️⃣"], ["satu", "1️⃣"],
  // Nature
  ["matahari", "☀️"], ["bulan", "🌙"], ["bintang", "⭐"], ["hujan", "🌧️"],
  ["awan", "☁️"], ["pokok", "🌳"], ["bunga", "🌸"], ["laut", "🌊"],
  // Islamic
  ["sembahyang", "🙏"], ["solat", "🙏"], ["quran", "📖"], ["al-quran", "📖"],
  ["kaabah", "🕋"], ["doa", "🤲"],
  // Adjectives
  ["besar", "🔼"], ["kecil", "🔽"], ["panjang", "📏"], ["pendek", "📏"],
  ["cepat", "⚡"], ["lambat", "🐢"], ["tinggi", "🏔️"], ["rendah", "⬇️"],
  // People / roles
  ["guru", "👩‍🏫"], ["doktor", "👨‍⚕️"], ["polis", "👮"], ["nelayan", "🎣"],
  ["pemandu", "🚗"], ["petani", "🌾"], ["askar", "💂"],
  // Verbs / actions
  ["makan", "🍽️"], ["minum", "🥤"], ["tidur", "😴"], ["belajar", "📚"],
  ["bermain", "🎮"], ["baca", "📖"], ["tulis", "✍️"], ["lari", "🏃"],
  ["duduk", "🪑"], ["berdiri", "🧍"],
]

function getVocabEmoji(item: VocabItem): string | undefined {
  if (item.emoji) return item.emoji
  const m = item.meaning.toLowerCase()
  for (const [key, emoji] of VOCAB_EMOJI) {
    if (m.includes(key)) return emoji
  }
  return undefined
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteReader({
  note,
  meta,
  prevNote,
  nextNote,
  source,
  year,
  subject,
}: {
  note: Note
  meta: SubjectMeta
  prevNote: Note | null
  nextNote: Note | null
  source: string
  year: string
  subject: string
}) {
  const isCompleted = useProgressStore((s) => s.isNoteCompleted(note.id))
  const stars = useProgressStore((s) => s.getNoteStars(note.id))

  const fullText = note.sections
    .map((s) => {
      if (s.type === "intro") return `${s.heading}. ${s.body}`
      if (s.type === "concept-cards") return s.items.map((c) => `${c.title}: ${c.body}`).join(". ")
      if (s.type === "callout") return s.text
      if (s.type === "steps") return `${s.heading}: ${s.items.join(". ")}`
      return ""
    })
    .join(" ")

  return (
    <motion.div
      className="max-w-2xl mx-auto px-4 py-6 pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero banner */}
      <motion.div
        className="rounded-3xl p-8 mb-8 text-center shadow-xl"
        style={{ backgroundColor: meta.colour }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <motion.div
          className="text-6xl mb-3"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {note.emoji || meta.emoji}
        </motion.div>
        <h1 className="text-2xl font-black text-white mb-1">Bab {note.chapter}</h1>
        <h2 className="text-xl font-bold text-white/90">{note.title}</h2>
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">
            ⏱ {note.estimatedMinutes} minit
          </span>
          {isCompleted && (
            <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">
              {"⭐".repeat(stars)} Selesai!
            </span>
          )}
          <ReadAloudButton text={fullText} colour={meta.colour} />
        </div>
      </motion.div>

      {/* Note sections */}
      <div className="flex flex-col gap-6">
        {note.sections.map((section, i) => (
          <NoteSection key={i} section={section} index={i} colour={meta.colour} />
        ))}
      </div>

      {/* Vocab */}
      {note.vocab && note.vocab.length > 0 && (
        <motion.div
          className="mt-8 bg-white rounded-2xl p-6 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
        >
          <h3 className="text-xl font-black text-gray-800 mb-4">📝 Kosa Kata</h3>
          <div className="flex flex-col divide-y divide-gray-100">
            {note.vocab.map((v, i) => (
              <div key={i} className="flex items-baseline gap-3 py-2.5">
                <span className="font-black text-base shrink-0" style={{ color: meta.colour }} dir="rtl">
                  {v.word}
                </span>
                <span className="text-gray-500 font-semibold text-sm">—</span>
                <span className="text-gray-700 font-semibold text-sm leading-snug">{v.meaning}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Fun fact */}
      {note.funFact && (
        <motion.div
          className="mt-6 rounded-2xl p-5 flex gap-4 items-start"
          style={{ backgroundColor: meta.colour + "22" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
        >
          <span className="text-3xl shrink-0">🌟</span>
          <div className="flex-1 min-w-0">
            <div className="font-black text-gray-800 mb-1">Tahukah Kamu?</div>
            <p className="font-bold text-gray-800 text-base leading-relaxed">{note.funFact}</p>
          </div>
        </motion.div>
      )}

      {/* Knowledge graph — hidden for now */}

      {/* Quiz */}
      {note.quiz && note.quiz.length > 0 && (
        <div className="mt-8">
          <QuizSection noteId={note.id} questions={note.quiz} colour={meta.colour} />
        </div>
      )}

      {/* Chapter navigation */}
      <div className="mt-10 flex gap-4">
        {prevNote ? (
          <Link href={`/${source}/${year}/${subject}/${prevNote.id}`} className="flex-1">
            <motion.div
              className="bg-white rounded-2xl p-4 shadow-md text-center font-bold text-gray-700 border-2 border-gray-200"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              ← Bab {prevNote.chapter}
            </motion.div>
          </Link>
        ) : <div className="flex-1" />}

        <Link href={`/${source}/${year}/${subject}`}>
          <motion.div
            className="bg-white rounded-2xl px-5 py-4 shadow-md font-bold text-gray-700 border-2 border-gray-200"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            📋
          </motion.div>
        </Link>

        {nextNote ? (
          <Link href={`/${source}/${year}/${subject}/${nextNote.id}`} className="flex-1">
            <motion.div
              className="rounded-2xl p-4 shadow-md text-center font-bold text-white border-2"
              style={{ backgroundColor: meta.colour, borderColor: meta.colour }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Bab {nextNote.chapter} →
            </motion.div>
          </Link>
        ) : <div className="flex-1" />}
      </div>
    </motion.div>
  )
}
