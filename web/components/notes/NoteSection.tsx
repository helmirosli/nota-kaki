"use client"

import { motion } from "framer-motion"
import { SectionType, CardBody, CardBodyList, CardBodyArabic, CardBodyPairs } from "@/lib/types"

// ─── Auto-detect arabic pattern in plain strings ─────────────────────────────
// Only fires for legacy string bodies that match the doa/hadith/Quran pattern:
//   [instruction: ] 'ARABIC' [— Maksud: 'translation'] [(source)]
// For new notes, use { type: "arabic", ... } directly in JSON instead.

function detectArabicBody(body: string): CardBodyArabic | null {
  if (!/[؀-ۿ]/.test(body)) return null

  let text = body.trim()

  // 1. Strip trailing (source) citation
  let source: string | undefined
  const srcMatch = text.match(/\s*\(([^()]+)\)\s*$/)
  if (srcMatch && /Hadis|Riwayat|HR\b|Bukhari|Muslim|Tirmizi|Ahmad|Abu Dawud|Surah|Imam/i.test(srcMatch[1])) {
    source = srcMatch[1]
    text = text.slice(0, text.length - srcMatch[0].length).trim()
  }

  // 2. Split on "— Maksud:" or "— 'translation'"
  let translation: string | undefined
  const mIdx = text.search(/[—–]\s*[''"]?[Mm]aksud\s*:?[''"]?\s*/)
  if (mIdx >= 0) {
    // Find where the actual translation starts (after the colon/dash)
    const after = text.slice(mIdx).replace(/^[—–]\s*[Mm]aksud\s*:?\s*/, "")
    translation = after.replace(/^[''""]+|[''""]+$/g, "").trim()
    text = text.slice(0, mIdx).trim()
  } else {
    // Try: '— 'translation'' pattern (no Maksud keyword)
    const altSplit = text.search(/[—–]\s*[''""]/)
    if (altSplit >= 0) {
      translation = text.slice(altSplit).replace(/^[—–]\s*/, "").replace(/^[''""]+|[''""]+$/g, "").trim()
      text = text.slice(0, altSplit).trim()
    }
  }

  // 3. Extract Arabic block (quoted or bare)
  const aMatch = text.match(/[''"]?\s*([؀-ۿ][؀-ۿ\sً-ٟ]*)\s*[''"]?/)
  if (!aMatch || aMatch.index === undefined) return null

  const arabic = aMatch[1].trim()
  if (arabic.length < 5) return null  // too short to be a meaningful verse/doa

  const before = text.slice(0, aMatch.index).replace(/:\s*[''"]?\s*$/, ":").trim()

  return {
    type: "arabic",
    instruction: before || undefined,
    arabic,
    translation,
    source,
  }
}

// ─── Card body renderer ───────────────────────────────────────────────────────
// JSON is the source of truth. No string parsing — just dispatch on body type.

function SmartBody({ body, colour }: { body: CardBody; colour: string }) {
  // ── Plain string: try auto-detect arabic pattern, else plain text ────────
  if (typeof body === "string") {
    const auto = detectArabicBody(body)
    if (auto) {
      // Re-enter with a structured object — no duplication of rendering logic
      return <SmartBody body={auto} colour={colour} />
    }
    return <p className="text-gray-600 font-semibold text-sm leading-relaxed">{body}</p>
  }

  // ── Vocab / number pairs table ───────────────────────────────────────────
  if (body.type === "pairs") {
    return (
      <div className="flex flex-col gap-0 text-sm">
        {body.intro && (
          <p className="text-gray-700 font-semibold leading-relaxed mb-2">{body.intro}</p>
        )}
        <div className="rounded-xl overflow-hidden border border-gray-100">
          {body.rows.map((row, i) => (
            <div
              key={i}
              className={`flex items-center gap-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
            >
              {row.label !== undefined && (
                <span
                  className="w-10 shrink-0 text-center text-xs font-black py-2.5 self-stretch flex items-center justify-center"
                  style={{ backgroundColor: colour + "18", color: colour }}
                >
                  {row.label}
                </span>
              )}
              <span
                className="flex-1 text-right px-3 py-2.5 font-bold text-base leading-snug border-r border-gray-100"
                dir="rtl"
                style={{ color: colour }}
              >
                {row.arabic}
              </span>
              <span className="flex-1 px-3 py-2.5 text-gray-700 font-semibold text-sm leading-snug">
                {row.meaning}
              </span>
            </div>
          ))}
        </div>
        {body.outro && (
          <p
            className="text-xs font-bold mt-2 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: colour + "18", color: colour }}
          >
            {body.outro}
          </p>
        )}
      </div>
    )
  }

  // ── Numbered list ────────────────────────────────────────────────────────
  if (body.type === "list") {
    return (
      <div className="flex flex-col gap-2 text-sm">
        {body.intro && (
          <p className="text-gray-700 font-semibold leading-relaxed">{body.intro}</p>
        )}
        {body.items.map((item, i) => (
          <div key={i} className="flex gap-2.5 items-start">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0 mt-0.5"
              style={{ backgroundColor: colour }}
            >
              {i + 1}
            </span>
            <p className="text-gray-700 font-semibold leading-relaxed flex-1">{item}</p>
          </div>
        ))}
        {body.outro && (
          <p
            className="text-xs font-bold mt-1 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: colour + "18", color: colour }}
          >
            {body.outro}
          </p>
        )}
      </div>
    )
  }

  // ── Arabic doa / hadith / verse ──────────────────────────────────────────
  if (body.type === "arabic") {
    const blocks = [
      { instruction: body.instruction, arabic: body.arabic, translation: body.translation, source: body.source },
      ...(body.more ?? []),
    ]
    return (
      <div className="flex flex-col gap-3 text-sm">
        {blocks.map((block, bi) => (
          <div key={bi} className="flex flex-col gap-2">
            {bi > 0 && <hr className="border-dashed" style={{ borderColor: colour + "44" }} />}
            {block.instruction && (
              <p className="text-gray-700 font-semibold leading-relaxed">{block.instruction}</p>
            )}
            <div
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: colour + "18", border: `1.5px solid ${colour}44` }}
            >
              <p className="text-xl font-bold leading-loose whitespace-pre-line" dir="rtl" style={{ color: colour }}>
                {block.arabic}
              </p>
            </div>
            {block.translation && (
              <div className="flex gap-2 items-start">
                <span className="text-base shrink-0">💬</span>
                <p className="text-gray-700 font-semibold leading-relaxed">
                  <span className="font-black text-gray-800">Maksud: </span>
                  {block.translation}
                </p>
              </div>
            )}
            {block.source && (
              <div className="flex justify-end">
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  📖 {block.source}
                </span>
              </div>
            )}
          </div>
        ))}
        {body.outro && (
          <p className="text-gray-600 font-semibold text-sm leading-relaxed pt-1 border-t border-gray-100">
            {body.outro}
          </p>
        )}
      </div>
    )
  }

  return null
}

// ─── Section components ───────────────────────────────────────────────────────

export function NoteSection({
  section,
  index,
  colour,
}: {
  section: SectionType
  index: number
  colour: string
}) {
  const variants = {
    hidden: { opacity: 0, x: index % 2 === 0 ? -30 : 30 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      {section.type === "intro" && <IntroSection section={section} colour={colour} />}
      {section.type === "concept-cards" && <ConceptCardsSection section={section} colour={colour} />}
      {section.type === "callout" && <CalloutSection section={section} colour={colour} />}
      {section.type === "steps" && <StepsSection section={section} colour={colour} />}
    </motion.div>
  )
}

function IntroSection({ section, colour }: { section: Extract<SectionType, { type: "intro" }>; colour: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h3 className="text-xl font-black mb-3" style={{ color: colour }}>{section.heading}</h3>
      {typeof section.body === "string"
        ? <p className="text-gray-700 font-semibold leading-relaxed text-lg">{section.body}</p>
        : <SmartBody body={section.body} colour={colour} />
      }
    </div>
  )
}

function ConceptCardsSection({ section, colour }: { section: Extract<SectionType, { type: "concept-cards" }>; colour: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {section.items.map((card, i) => (
        <motion.div
          key={i}
          className="bg-white rounded-2xl p-5 shadow-md flex gap-4 items-start"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -4 }}
        >
          <span className="text-4xl shrink-0">{card.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="font-black text-gray-800 mb-2">{card.title}</div>
            <SmartBody body={card.body} colour={colour} />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function CalloutSection({ section, colour }: { section: Extract<SectionType, { type: "callout" }>; colour: string }) {
  return (
    <div
      className="rounded-2xl p-5 flex gap-4 items-start"
      style={{ backgroundColor: colour + "18", border: `2px solid ${colour}44` }}
    >
      <span className="text-4xl shrink-0">{section.icon}</span>
      <div className="flex-1 min-w-0">
        <CalloutContent text={section.text} colour={colour} />
      </div>
    </div>
  )
}

export function CalloutContent({ text, colour }: { text: CardBody; colour: string }) {
  // ── Structured list ────────────────────────────────────────────────────
  if (typeof text !== "string" && text.type === "list") {
    return <CalloutList body={text} colour={colour} />
  }

  // ── Structured arabic ──────────────────────────────────────────────────
  if (typeof text !== "string" && text.type === "arabic") {
    return <CalloutArabic body={text} colour={colour} />
  }

  // ── Pairs table ────────────────────────────────────────────────────────
  if (typeof text !== "string" && text.type === "pairs") {
    return <SmartBody body={text} colour={colour} />
  }

  // ── Plain string: try auto-detect arabic, else plain text ──────────────
  const arabic = detectArabicBody(text as string)
  if (arabic) return <CalloutArabic body={arabic} colour={colour} />
  return <p className="font-bold text-gray-800 text-lg">{text as string}</p>
}

function CalloutList({ body, colour }: { body: CardBodyList; colour: string }) {
  return (
    <div className="flex flex-col gap-2">
      {body.intro && (
        <p className="font-black text-gray-800 text-base mb-0.5">{body.intro}</p>
      )}
      {body.items.map((item, i) => (
        <div key={i} className="flex gap-2.5 items-start">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0 mt-0.5"
            style={{ backgroundColor: colour }}
          >
            {i + 1}
          </span>
          <p className="font-semibold text-gray-800 text-sm leading-relaxed flex-1">{item}</p>
        </div>
      ))}
      {body.outro && (
        <p className="text-xs font-bold mt-1" style={{ color: colour }}>
          {body.outro}
        </p>
      )}
    </div>
  )
}

function CalloutArabic({ body, colour }: { body: CardBodyArabic; colour: string }) {
  const blocks = [
    { instruction: body.instruction, arabic: body.arabic, translation: body.translation, source: body.source },
    ...(body.more ?? []),
  ]
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, bi) => (
        <div key={bi} className="flex flex-col gap-2">
          {bi > 0 && <hr className="border-dashed" style={{ borderColor: colour + "66" }} />}
          {block.instruction && (
            <p className="font-black text-gray-800 text-base">{block.instruction}</p>
          )}
          {/* No inner box — the callout itself is the container */}
          <p className="text-xl font-bold leading-loose text-center whitespace-pre-line" dir="rtl" style={{ color: colour }}>
            {block.arabic}
          </p>
          {block.translation && (
            <div className="flex gap-2 items-start">
              <span className="shrink-0">💬</span>
              <p className="font-semibold text-gray-800 text-sm leading-relaxed">{block.translation}</p>
            </div>
          )}
          {block.source && (
            <div className="flex justify-end">
              <span className="text-xs font-bold text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">
                📖 {block.source}
              </span>
            </div>
          )}
        </div>
      ))}
      {body.outro && (
        <p className="font-semibold text-gray-800 text-sm leading-relaxed pt-2 border-t border-white/50">
          {body.outro}
        </p>
      )}
    </div>
  )
}

function StepsSection({ section, colour }: { section: Extract<SectionType, { type: "steps" }>; colour: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h3 className="text-xl font-black mb-4" style={{ color: colour }}>{section.heading}</h3>
      <ol className="flex flex-col gap-4">
        {section.items.map((step, i) => (
          <motion.li
            key={i}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black shrink-0 text-sm mt-0.5"
              style={{ backgroundColor: colour }}
            >
              {i + 1}
            </span>
            {typeof step === "string" ? (
              <span className="text-gray-700 font-semibold leading-relaxed pt-1">{step}</span>
            ) : (
              <div className="flex-1 min-w-0">
                <SmartBody body={step} colour={colour} />
              </div>
            )}
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
