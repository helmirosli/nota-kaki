import Anthropic from "@anthropic-ai/sdk"
import { Note, Source, Year, Subject } from "../lib/types"

const client = new Anthropic()

const SYSTEM_PROMPT = `Kamu adalah pereka kurikulum yang membuat nota belajar menarik untuk kanak-kanak Muslim berumur 7-12 tahun di Malaysia. Kamu menulis dalam Bahasa Melayu yang mudah dan menyeronokkan. Nota mesti ringkas, visual-friendly, dan penuh semangat.

PENTING: Balas HANYA dengan JSON yang sah. Tiada teks lain di luar JSON.`

function buildUserPrompt(
  rawText: string,
  subject: string,
  year: string,
  chapterHint: string,
  noteId: string,
  source: Source,
  yearKey: Year,
  subjectKey: Subject,
  chapterNum: number,
  colour: string
): string {
  return `Berikut adalah kandungan daripada buku teks ${subject} ${year}:

<text>
${rawText.slice(0, 12000)}
</text>

Tukarkan kandungan ini kepada JSON nota yang sesuai untuk kanak-kanak. Gunakan skema TEPAT ini:

{
  "id": "${noteId}",
  "source": "${source}",
  "year": "${yearKey}",
  "subject": "${subjectKey}",
  "chapter": ${chapterNum},
  "title": "<tajuk menarik untuk bab ini dalam BM>",
  "emoji": "<1 emoji sesuai>",
  "colour": "${colour}",
  "estimatedMinutes": <5-15>,
  "sections": [
    { "type": "intro", "heading": "<tajuk>", "body": "<2-3 ayat mudah untuk kanak-kanak>" },
    { "type": "concept-cards", "items": [
      { "icon": "<emoji>", "title": "<konsep>", "body": "<1-2 ayat>" }
    ]},
    { "type": "callout", "icon": "💡", "text": "<fakta menarik atau peringatan>" },
    { "type": "steps", "heading": "<tajuk>", "items": ["<langkah 1>", "<langkah 2>"] }
  ],
  "quiz": [
    { "q": "<soalan mudah>", "options": ["<a>", "<b>", "<c>", "<d>"], "answer": <0-3> }
  ],
  "graph": {
    "nodes": [{ "id": "n1", "label": "<konsep>", "colour": "<hex>" }],
    "edges": [{ "id": "e1", "source": "n1", "target": "n2", "label": "<hubungan>" }]
  },
  "vocab": [{ "word": "<perkataan>", "meaning": "<maksud mudah>" }],
  "funFact": "<fakta fun dalam 1-2 ayat>"
}

Syarat:
- sections: 3-5 item, MESTI ada "intro" sebagai pertama
- concept-cards: 3-5 kad
- quiz: TEPAT 4 soalan
- graph: 5-8 nodes, 4-7 edges
- vocab: 3-5 perkataan
- Semua teks dalam Bahasa Melayu`
}

const SUBJECT_COLOURS: Record<string, string> = {
  akhlak: "#4CAF50",
  "bahasa-arab": "#2196F3",
  feqah: "#9C27B0",
  jawi: "#FF9800",
  hafazan: "#E91E63",
  tauhid: "#FFB300",
}

export async function generateNote(
  rawText: string,
  source: Source,
  year: Year,
  subject: Subject,
  chapterNum: number
): Promise<Note> {
  const noteId = `${source}-${year}-${subject}-bab${chapterNum}`
  const colour = SUBJECT_COLOURS[subject] ?? "#4CAF50"
  const subjectLabel = subject.replace("-", " ")
  const yearLabel = year.replace("-", " ").replace("tahun", "Tahun")

  const prompt = buildUserPrompt(
    rawText,
    subjectLabel,
    yearLabel,
    `Bab ${chapterNum}`,
    noteId,
    source,
    year,
    subject,
    chapterNum,
    colour
  )

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  })

  const raw = (message.content[0] as any).text.trim()
  // strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
  return JSON.parse(cleaned) as Note
}
