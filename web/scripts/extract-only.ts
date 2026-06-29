import * as fs from "fs"
import * as path from "path"
import * as url from "url"

// pdfjs-dist v5 references DOMMatrix at module init time — provide a minimal polyfill for Node
if (typeof (globalThis as any).DOMMatrix === "undefined") {
  ;(globalThis as any).DOMMatrix = class DOMMatrix {
    a=1; b=0; c=0; d=1; e=0; f=0
    m11=1; m12=0; m13=0; m14=0
    m21=0; m22=1; m23=0; m24=0
    m31=0; m32=0; m33=1; m34=0
    m41=0; m42=0; m43=0; m44=1
    is2D=true; isIdentity=true
    static fromMatrix() { return new (globalThis as any).DOMMatrix() }
    static fromFloat32Array() { return new (globalThis as any).DOMMatrix() }
    static fromFloat64Array() { return new (globalThis as any).DOMMatrix() }
    multiply() { return this }
    translate() { return this }
    scale() { return this }
    rotate() { return this }
    rotateFromVector() { return this }
    inverse() { return this }
    transformPoint(p: any) { return p }
    toFloat32Array() { return new Float32Array(16) }
    toFloat64Array() { return new Float64Array(16) }
    toString() { return "matrix(1, 0, 0, 1, 0, 0)" }
  }
}

const REFS_DIR = path.resolve(__dirname, "../../references")
const OUT_DIR = path.resolve(__dirname, "../data/extracted")

const SUBJECT_MAP: Record<string, string> = {
  "akhlak": "akhlak",
  "bahasa arab": "bahasa-arab",
  "feqah": "feqah",
  "jawi": "jawi",
  "hafazan": "hafazan",
  "tauhid": "tauhid",
  "imlak": "imlak",
  "khat": "khat",
  "sirah": "sirah",
  "tajwid": "tajwid",
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
