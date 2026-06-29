import * as fs from "fs"
import * as path from "path"
import * as url from "url"

const REFS_DIR = path.resolve(__dirname, "../../references")
const OUT_DIR = path.resolve(__dirname, "../data/extracted")

const SUBJECT_MAP: Record<string, string> = {
  "akhlak": "akhlak",
  "bahasa arab": "bahasa-arab",
  "feqah": "feqah",
  "jawi": "jawi",
  "hafazan": "hafazan",
  "tauhid": "tauhid",
}

function parseFilename(filename: string) {
  const lower = filename.toLowerCase()
  let subject = "unknown"
  for (const [key, val] of Object.entries(SUBJECT_MAP)) {
    if (lower.includes(key)) { subject = val; break }
  }
  const yearMatch = lower.match(/tahun[- ]?(\d)/)
  const year = yearMatch ? `tahun-${yearMatch[1]}` : "unknown"
  return { subject, year }
}

function parseSourceFromDir(dir: string) {
  if (dir.includes("jais")) return "jais"
  if (dir.includes("kssr")) return "kssr"
  return "jais"
}

async function extractPdfText(pdfPath: string): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const workerPath = path.resolve(__dirname, "../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
  pdfjsLib.GlobalWorkerOptions.workerSrc = url.pathToFileURL(workerPath).href

  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map((item: any) => item.str).join(" ").replace(/\s+/g, " ").trim()
    if (text.length > 10) pages.push(`[Halaman ${i}]\n${text}`)
  }

  return pages.join("\n\n")
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  const pdfs: string[] = []
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith(".pdf")) pdfs.push(full)
    }
  }
  walk(REFS_DIR)

  console.log(`\nFound ${pdfs.length} PDFs\n`)

  for (const pdfPath of pdfs) {
    const filename = path.basename(pdfPath)
    const { subject, year } = parseFilename(filename)
    const source = parseSourceFromDir(pdfPath)
    const outName = `${source}-${year}-${subject}.txt`
    const outPath = path.join(OUT_DIR, outName)

    if (fs.existsSync(outPath)) {
      console.log(`  ✓ Already extracted: ${outName}`)
      continue
    }

    console.log(`  📄 Extracting: ${filename}`)
    try {
      const text = await extractPdfText(pdfPath)
      fs.writeFileSync(outPath, text)
      console.log(`     ✅ Saved: ${outName} (${text.length} chars)`)
    } catch (err) {
      console.error(`     ❌ Failed:`, err)
    }
  }

  console.log(`\n✅ All done! Text files saved to: data/extracted/`)
  console.log(`\nNext: open each .txt in data/extracted/ and paste into Claude.ai`)
}

main()
