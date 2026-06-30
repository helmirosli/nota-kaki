export type Source = "jais" | "kssr"
export type Year = "tahun-1" | "tahun-2" | "tahun-3" | "tahun-4" | "tahun-5" | "tahun-6"
export type Subject = "akhlak" | "bahasa-arab" | "feqah" | "jawi" | "hafazan" | "tauhid"
  | "imlak" | "khat" | "sirah" | "tajwid"

export interface SubjectMeta {
  id: Subject
  label: string
  emoji: string
  colour: string
}

export const SUBJECTS: SubjectMeta[] = [
  { id: "akhlak",      label: "Akhlak",      emoji: "🌱", colour: "#4CAF50" },
  { id: "bahasa-arab", label: "Bahasa Arab",  emoji: "📖", colour: "#2196F3" },
  { id: "feqah",       label: "Feqah",        emoji: "🕌", colour: "#9C27B0" },
  { id: "jawi",        label: "Jawi",         emoji: "✏️",  colour: "#FF9800" },
  { id: "hafazan",     label: "Hafazan",      emoji: "🎵", colour: "#E91E63" },
  { id: "tauhid",      label: "Tauhid",       emoji: "⭐", colour: "#FFB300" },
  { id: "imlak",       label: "Imlak",        emoji: "📝", colour: "#009688" },
  { id: "khat",        label: "Khat",         emoji: "🖊️",  colour: "#795548" },
  { id: "sirah",       label: "Sirah",        emoji: "🌙", colour: "#FF6F00" },
  { id: "tajwid",      label: "Tajwid",       emoji: "📿", colour: "#1A237E" },
]

// ─── Note schema ─────────────────────────────────────────────────────────────

export type SectionType =
  | IntroSection
  | ConceptCardsSection
  | CalloutSection
  | StepsSection

export interface IntroSection {
  type: "intro"
  heading: string
  body: CardBody
}

export interface ConceptCardsSection {
  type: "concept-cards"
  items: ConceptCard[]
}

// ─── Concept card body — explicit types, no parsing needed ───────────────────

/** Plain string kept for backward compatibility with existing JSON files. */
export type CardBody = string | CardBodyList | CardBodyArabic | CardBodyPairs

/** Numbered or bulleted list with optional intro and outro lines. */
export interface CardBodyList {
  type: "list"
  intro?: string
  items: string[]
  outro?: string
}

/** Arabic doa / hadith / Quran verse with structured translation. */
export interface CardBodyArabic {
  type: "arabic"
  instruction?: string   // text before the Arabic (e.g. "Sebelum makan, baca:")
  arabic: string         // Arabic text — rendered RTL in a coloured box
  translation?: string   // Malay/English meaning
  source?: string        // e.g. "Hadis Riwayat Bukhari & Muslim"
  outro?: string         // closing remark shown after the source badge
  more?: Array<{         // additional doa/verse blocks in the same card
    instruction?: string
    arabic: string
    translation?: string
    source?: string
  }>
}

/** Side-by-side rows: optional label | Arabic (RTL) | Malay meaning. For vocab tables and number lists. */
export interface CardBodyPairs {
  type: "pairs"
  intro?: string
  rows: { label?: string; arabic: string; meaning: string }[]
  outro?: string
}

export interface ConceptCard {
  icon: string
  title: string
  body: CardBody
}

export interface CalloutSection {
  type: "callout"
  icon: string
  text: CardBody   // string | CardBodyList | CardBodyArabic
}

export interface StepsSection {
  type: "steps"
  heading: string
  items: CardBody[]   // string OR { type: "arabic" } for steps that contain a doa/verse
}

export interface QuizQuestion {
  q: string
  options: string[]
  answer: number
}

export interface GraphNode {
  id: string
  label: string
  colour: string
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
}

export interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface VocabItem {
  word: string
  meaning: string
  emoji?: string
}

export interface Note {
  id: string
  source: Source
  year: Year
  subject: Subject
  chapter: number
  title: string
  emoji: string
  colour: string
  estimatedMinutes: number
  sections: SectionType[]
  quiz: QuizQuestion[]
  graph: KnowledgeGraph
  vocab: VocabItem[]
  funFact: CardBody
}

// ─── Manifest ────────────────────────────────────────────────────────────────

export interface ManifestEntry {
  pdfPath: string
  noteId: string
  processedAt: string
}

export interface Manifest {
  processed: ManifestEntry[]
}
