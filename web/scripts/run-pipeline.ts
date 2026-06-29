import * as fs from "fs"
import * as path from "path"
import { extractPdfText } from "./extract-pdf"
import { generateNote } from "./generate-notes"
import { Source, Year, Subject, Manifest } from "../lib/types"

const REFS_DIR = path.resolve(__dirname, "../../references")
const DATA_DIR = path.resolve(__dirname, "../data/notes")
const MANIFEST_PATH = path.join(DATA_DIR, "manifest.json")

const SUBJECT_MAP: Record<string, Subject> = {
  akhlak: "akhlak",
  "bahasa arab": "bahasa-arab",
  "bahasa-arab": "bahasa-arab",
  feqah: "feqah",
  jawi: "jawi",
  hafazan: "hafazan",
  tauhid: "tauhid",
}

function parseFilename(filename: string): { subject: Subject | null; year: Year | null } {
  const lower = filename.toLowerCase()

  let subject: Subject | null = null
  for (const [key, val] of Object.entries(SUBJECT_MAP)) {
    if (lower.includes(key)) { subject = val; break }
  }

  let year: Year | null = null
  const yearMatch = lower.match(/tahun[- ]?(\d)/)
  if (yearMatch) year = `tahun-${yearMatch[1]}` as Year

  return { subject, year }
}

function parseSourceFromDir(dir: string): Source {
  if (dir.includes("jais")) return "jais"
  if (dir.includes("kssr")) return "kssr"
  return "jais"
}

function loadManifest(): Manifest {
  if (!fs.existsSync(MANIFEST_PATH)) return { processed: [] }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"))
}

function saveManifest(manifest: Manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

  const manifest = loadManifest()
  const processedPaths = new Set(manifest.processed.map((e) => e.pdfPath))

  const pdfs: string[] = []
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith(".pdf")) pdfs.push(full)
    }
  }
  walk(REFS_DIR)

  const newPdfs = pdfs.filter((p) => !processedPaths.has(p))
  console.log(`\nFound ${pdfs.length} PDFs total, ${newPdfs.length} new to process.\n`)

  for (const pdfPath of newPdfs) {
    const filename = path.basename(pdfPath)
    const dirPath = path.dirname(pdfPath)
    const { subject, year } = parseFilename(filename)
    const source = parseSourceFromDir(dirPath)

    if (!subject || !year) {
      console.warn(`  ⚠️  Skipping (cannot parse): ${filename}`)
      continue
    }

    console.log(`  📄 Processing: ${filename}`)
    console.log(`     source=${source} year=${year} subject=${subject}`)

    try {
      const rawText = await extractPdfText(pdfPath)
      console.log(`     Extracted ${rawText.length} chars`)

      // Split into chunks of ~8000 chars, treat each as a chapter
      const chunkSize = 8000
      const chunks: string[] = []
      for (let i = 0; i < rawText.length; i += chunkSize) {
        chunks.push(rawText.slice(i, i + chunkSize))
      }

      for (let i = 0; i < chunks.length; i++) {
        const chapterNum = i + 1
        const noteId = `${source}-${year}-${subject}-bab${chapterNum}`
        const notePath = path.join(DATA_DIR, `${noteId}.json`)

        if (fs.existsSync(notePath)) {
          console.log(`     ✓ Note ${noteId} already exists, skipping`)
          continue
        }

        console.log(`     🤖 Generating note: ${noteId}`)
        const note = await generateNote(chunks[i], source, year, subject, chapterNum)
        fs.writeFileSync(notePath, JSON.stringify(note, null, 2))
        console.log(`     ✅ Saved: ${noteId}.json`)

        manifest.processed.push({ pdfPath, noteId, processedAt: new Date().toISOString() })
        saveManifest(manifest)

        // small delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 500))
      }
    } catch (err) {
      console.error(`  ❌ Failed: ${filename}`, err)
    }
  }

  console.log("\n🎉 Pipeline complete!")
}

main()
