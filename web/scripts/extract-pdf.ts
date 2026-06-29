import * as fs from "fs"
import * as path from "path"
import * as url from "url"

export async function extractPdfText(pdfPath: string): Promise<string> {
  // Import pdfjs with worker path pointing to the bundled worker file
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")

  const workerPath = path.resolve(
    path.dirname(url.fileURLToPath(import.meta.url || "file://" + __filename)),
    "../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  )
  pdfjsLib.GlobalWorkerOptions.workerSrc = url.pathToFileURL(workerPath).href

  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .map((item: any) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
    if (text.length > 10) pages.push(`[Halaman ${i}]\n${text}`)
  }

  return pages.join("\n\n")
}
