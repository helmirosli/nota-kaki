# PDF Pipeline

> Converts raw curriculum PDFs into structured kid-friendly JSON notes using Claude Haiku. Runs offline before the web app.

← [[Architecture]]

---

## Location

```
web/scripts/
├── run-pipeline.ts    ← orchestrator (entry point)
├── extract-pdf.ts     ← PDF → plain text (pdfjs-dist)
├── generate-notes.ts  ← text → JSON (Claude Haiku)
└── extract-only.ts    ← standalone extraction (debug/inspect)
```

---

## Data Flow

```
references/jais/tahun-N/*.pdf
        ↓  run-pipeline.ts
manifest.json (already processed? skip)
        ↓  extract-pdf.ts
raw text string (via pdfjs-dist)
        ↓  chunk into 8000-char segments
Claude Haiku API (generate-notes.ts)
        ↓  parse JSON response
web/data/notes/{noteId}.json
        ↓
manifest.json updated with timestamp
```

---

## `run-pipeline.ts` — Orchestrator

- Scans `references/{source}/tahun-N/` recursively for `.pdf` files
- Parses filename to extract `source` (jais/kssr), `year` (tahun-1..6), `subject`
- Reads `manifest.json` → skips already-processed PDFs (incremental)
- Calls `extractText()` then `generateNotes()` per PDF
- Adds 500ms delay between API calls (rate limiting)
- Writes updated `manifest.json` on completion

**To run:**
```bash
cd web
npx ts-node scripts/run-pipeline.ts
```

---

## `extract-pdf.ts` — PDF Text Extractor

- Uses **pdfjs-dist 5** with a DOMMatrix polyfill for Node.js (no browser DOM)
- Loads PDF binary from disk, iterates pages, extracts text items
- Returns a single concatenated string (all pages merged)
- Image-only PDFs return empty/minimal text (feqah, hafazan bab1 stubs needed manual content)

```typescript
export async function extractText(pdfPath: string): Promise<string>
```

---

## `generate-notes.ts` — Claude Note Generator

- **Model:** `claude-haiku-4-5` (cost-effective for bulk generation)
- **Max tokens:** 4096 per note
- **System prompt:** Instructs Claude to produce JSON only (no preamble, no markdown fences) in Bahasa Melayu, kid-friendly, following the exact [[Services/Note Schema]]
- Strips markdown code fences (``` json ... ```) from response before parsing
- On parse failure: logs error and returns `null` (pipeline continues)

```typescript
export async function generateNote(text: string, subject: string, year: string, chapter: number): Promise<Note | null>
```

---

## `extract-only.ts` — Standalone Extractor

- Runs extraction only — no Claude call
- Dumps raw text to `web/data/extracted/{noteId}.txt`
- Use this to inspect PDF content before sending to Claude, or when PDFs are image-based

---

## Manifest (`web/data/manifest.json`)

```json
{
  "processed": [
    {
      "pdfPath": "references/jais/tahun-1/akhlak-bab1.pdf",
      "noteId": "jais-tahun-1-akhlak-bab1",
      "processedAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

## Image-Based PDFs

Some JAIS PDFs (feqah, hafazan) are scanned images — pdfjs returns 0 bytes of text. Fix: write note content manually based on standard JAIS curriculum. See [[Services/Note Schema]] for structure.

---

## Adding New Content

1. Drop PDF into `references/jais/tahun-N/subject-babN.pdf`
2. Filename must match: `{subject}-bab{N}.pdf`
3. Run `npx ts-node scripts/run-pipeline.ts`
4. Verify output in `web/data/notes/`

---

## Dependencies

- `pdfjs-dist` 5.6.205
- `@anthropic-ai/sdk` 0.106.0
- `ANTHROPIC_API_KEY` env var required
