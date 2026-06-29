# Nota Kaki — Content Creation Guide

Reference doc for creating new tahun content (tahun-3, tahun-4, …). All patterns here are derived from tahun-1 and tahun-2 content already in the repo.

---

## 1. Project Overview

**Nota Kaki** is a kids' Islamic education app for primary school students in Malaysia.
Curriculum source: **JAIS** (Jabatan Agama Islam Selangor) — standard Islamic studies syllabus.

Each *bab* (chapter) is one JSON file in `web/data/notes/`.
The app renders these files as interactive note pages with concept cards, callouts, quizzes, knowledge graphs, and vocab.

---

## 2. File Naming Convention

```
web/data/notes/{source}-{year}-{subject}-bab{N}.json
```

Examples:
- `jais-tahun-1-akhlak-bab1.json`
- `jais-tahun-3-feqah-bab2.json`

**Source:** `jais` (only source for now)
**Year:** `tahun-1` … `tahun-6`
**Subject:** `akhlak` | `bahasa-arab` | `feqah` | `jawi` | `hafazan` | `tauhid`

---

## 3. Subject Colours & Emojis

| Subject      | Colour    | Emoji | Label        |
|--------------|-----------|-------|--------------|
| akhlak       | `#4CAF50` | 🌱    | Akhlak       |
| bahasa-arab  | `#2196F3` | 📖    | Bahasa Arab  |
| feqah        | `#9C27B0` | 🕌    | Feqah        |
| jawi         | `#FF9800` | ✏️    | Jawi         |
| hafazan      | `#E91E63` | 🎵    | Hafazan      |
| tauhid       | `#FFB300` | ⭐    | Tauhid       |

Use the subject colour for all `colour` fields in the JSON file (top-level + graph nodes).

---

## 4. Full JSON Schema

Every note file must match this structure exactly (see `web/lib/types.ts`):

```jsonc
{
  "id": "jais-tahun-X-{subject}-babN",
  "source": "jais",
  "year": "tahun-X",
  "subject": "{subject}",
  "chapter": N,
  "title": "Tajuk Menarik — Subtitle",
  "emoji": "🌱",
  "colour": "#4CAF50",
  "estimatedMinutes": 10,
  "sections": [ /* see §5 */ ],
  "quiz": [ /* see §6 */ ],
  "graph": { /* see §7 */ },
  "vocab": [ /* see §8 */ ],
  "funFact": /* CardBody — see §9 */
}
```

---

## 5. Sections

Each note has 4 sections in order: `intro`, `concept-cards`, `callout`, `steps`.

### 5.1 Intro

```json
{
  "type": "intro",
  "heading": "Tajuk Menarik 🎯",
  "body": "2–3 ayat mudah yang hype topik ni untuk budak."
}
```

`body` can be a plain string OR a `CardBodyArabic` (use arabic type when the intro contains a hadith/ayat as the hook).

### 5.2 Concept Cards

```json
{
  "type": "concept-cards",
  "items": [
    { "icon": "❓", "title": "Tajuk Kad", "body": /* CardBody */ }
  ]
}
```

Aim for **4 concept cards** per bab. Each `body` is a `CardBody` — see §9 for types.

### 5.3 Callout

```json
{
  "type": "callout",
  "icon": "📖",
  "text": /* CardBody */
}
```

Usually contains a Quran ayat or hadith — use `CardBodyArabic` type. Never leave as plain string if there is Arabic script.

### 5.4 Steps

```json
{
  "type": "steps",
  "heading": "Langkah-langkah 📝",
  "items": ["Langkah 1", "Langkah 2", "Langkah 3"]
}
```

Items are usually plain strings. Use `CardBodyArabic` for a step that IS a doa/bacaan.

---

## 6. Quiz

4 questions, each with 4 options (`options[0..3]`), `answer` is the 0-based index of correct answer.

```json
[
  { "q": "Soalan?", "options": ["A", "B", "C", "D"], "answer": 0 }
]
```

Mix answer positions — don't always put the correct answer at index 0 or 1.

---

## 7. Knowledge Graph

```json
{
  "nodes": [
    { "id": "n1", "label": "Konsep Utama", "colour": "#4CAF50" },
    { "id": "n2", "label": "Sub Konsep", "colour": "#388E3C" },
    { "id": "n3", "label": "Contoh", "colour": "#A5D6A7" }
  ],
  "edges": [
    { "id": "e1", "source": "n1", "target": "n2", "label": "jenis" }
  ]
}
```

- 5–6 nodes, 4–5 edges is a good size
- Use `colour` variations of the subject colour (dark → light shades)
- Edge labels: `jenis`, `contoh`, `tujuan`, `sebab`, `akibat`, `cara`, `rukun`, `syarat`, `hikmah`

---

## 8. Vocab

```json
[
  { "word": "عَرَبِيّ", "meaning": "arab — maksud dalam BM" }
]
```

4–5 vocab items per bab. Format: `word` = Arabic script, `meaning` = romanised + BM explanation.

---

## 9. CardBody Types — CRITICAL RULES

This is the most important section. Arabic rendering breaks when the wrong type is used.

### Type 1: Plain string (OK for Malay-only text)

```json
"body": "Teks Bahasa Melayu tanpa skrip Arab."
```

**NEVER mix Arabic script into a plain string** — it causes RTL/LTR rendering glitches.

### Type 2: `CardBodyList` (for numbered/bulleted lists)

```json
"body": {
  "type": "list",
  "intro": "Ayat pengenalan (optional).",
  "items": [
    "Item 1",
    "Item 2 — boleh ada romanised arabic seperti Subhanallah"
  ],
  "outro": "Ayat penutup (optional)."
}
```

Use when the card has 3+ points. Items can contain romanised Arabic (e.g. "Subhanallah") — that is fine. Items must NOT contain actual Arabic script (**سُبْحَانَ**).

### Type 3: `CardBodyArabic` (for doa, ayat Quran, hadith)

```json
"body": {
  "type": "arabic",
  "instruction": "Teks sebelum Arabic (optional). Contoh: 'Nabi ﷺ bersabda:'",
  "arabic": "اَلصَّلَاةُ عِمَادُ الدِّينِ",
  "translation": "Solat adalah tiang agama.",
  "source": "Hadis Riwayat al-Baihaqi",
  "outro": "Penutup selepas source badge (optional).",
  "more": [
    {
      "instruction": "Doa kedua (optional):",
      "arabic": "بِسْمِ اللهِ",
      "translation": "Dengan nama Allah.",
      "source": "optional"
    }
  ]
}
```

Use `more[]` when a card contains multiple doa/ayat in sequence.

### Golden rule summary

| Content contains...              | Use type          |
|----------------------------------|-------------------|
| Malay text only, ≤2 sentences    | plain `string`    |
| Malay list of 3+ items           | `list`            |
| Any Arabic script (ب، س، etc.)  | `arabic`          |
| Multiple doa in one card         | `arabic` + `more` |

### funFact field

`funFact` at the top level also accepts any `CardBody`. If funFact contains Arabic script, use `CardBodyArabic`:

```json
"funFact": {
  "type": "arabic",
  "instruction": "Nabi ﷺ bersabda:",
  "arabic": "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
  "translation": "Sesungguhnya setiap amalan itu bergantung kepada niat.",
  "outro": "Niat yang betul = pahala berganda!"
}
```

---

## 10. Workflow to Add a New Tahun

### Step 1 — Register the year and subjects

Check `web/lib/notes.ts` (or wherever `getNotesBySubject` is defined). If `tahun-3` is not yet in the Year type, add it to `web/lib/types.ts`:

```typescript
export type Year = "tahun-1" | "tahun-2" | "tahun-3" | ...
```

Then add the year to the year labels map in `web/lib/constants.ts` (or wherever `YEAR_LABELS` lives).

### Step 2 — Create JSON files

Name: `jais-tahun-3-{subject}-bab{N}.json`

For each subject, create one file per bab. Typical bab count per subject per tahun:

| Subject      | Tahun 1 bab | Tahun 2 bab |
|--------------|-------------|-------------|
| akhlak       | 6           | 7           |
| bahasa-arab  | 9           | 7           |
| feqah        | 5           | 5           |
| jawi         | 6           | 4           |
| hafazan      | 5           | 5           |
| tauhid       | 6           | 6           |

### Step 3 — Verify Arabic rendering

After writing, visit each page at `http://localhost/jais/tahun-3/{subject}/jais-tahun-3-{subject}-bab{N}` and confirm:
- Arabic text appears RTL in a coloured box
- No garbled mixed-direction text
- funFact renders correctly

---

## 11. Tahun 1 & 2 Curriculum Topics (Reference)

### Tahun 1 Akhlak (6 bab)
1. Adab berdoa
2. Adab memberi dan menerima
3. Adab bercakap
4. Adab menjaga kebersihan
5. Adab makan dan minum
6. Adab dengan ibu bapa

### Tahun 1 Bahasa Arab (9 bab)
1. Huruf hijaiyah
2. Harakat (baris)
3. Perkataan asas (nombor 1–10)
4. Anggota badan
5. Warna
6. Binatang
7. Makanan & minuman
8. Keluarga
9. Aktiviti harian

### Tahun 1 Feqah (5 bab)
1. Bersuci — air dan najis
2. Wudhu
3. Azan dan iqamat
4. Solat fardhu — pengenalan
5. Waktu solat

### Tahun 1 Jawi (6 bab)
1. Huruf jawi tunggal
2. Huruf jawi bersambung
3. Membaca suku kata
4. Membaca perkataan
5. Menulis huruf jawi
6. Ayat mudah jawi

### Tahun 1 Hafazan (5 bab)
1. Surah al-Fatihah
2. Surah al-Ikhlas
3. Surah al-Falaq
4. Surah an-Nas
5. Surah al-Asr

### Tahun 1 Tauhid (6 bab)
1. Mengenal Allah
2. Asmaul Husna (1–5)
3. Rukun Iman — pengenalan
4. Iman kepada Allah
5. Iman kepada Malaikat
6. Iman kepada Kitab

---

### Tahun 2 Akhlak (7 bab)
1. Adab makan (doa, adab sebelum/semasa/selepas)
2. Adab tidur (doa sebelum/selepas tidur)
3. Adab menaiki kenderaan
4. Adab masuk dan keluar rumah
5. Adab dengan guru
6. Adab membaca al-Quran
7. Adab menjaga alam sekitar

### Tahun 2 Bahasa Arab (7 bab)
1–7: Vocabulary & basic sentences (bab1–7 already written)

### Tahun 2 Feqah (5 bab)
1. Tayammum
2. Mandi wajib
3. Cara solat yang betul (13 rukun)
4. Bacaan dalam solat
5. Solat sunat (rawatib, tahiyyatul masjid, dhuha, witir)

### Tahun 2 Jawi (4 bab)
1–4: Intermediate jawi reading/writing

### Tahun 2 Hafazan (5 bab)
1–5: Surah-surah juzuk amma (bab1–5 already written)

### Tahun 2 Tauhid (6 bab)
1–6: Rukun Iman deeper coverage (bab1–6 already written)

---

## 12. Common Pitfalls & Fixes

| Problem | Symptom | Fix |
|---------|---------|-----|
| Inline Arabic in plain string | Garbled text direction on screen | Convert body to `{ type: "arabic" }` or `{ type: "list" }` |
| funFact with Arabic script | Broken rendering in fact box | Change funFact to `CardBodyArabic` |
| Wrong concept card type | Numbers/list looks like one paragraph | Use `{ type: "list" }` with `items[]` |
| Multiple doa in one card | Only first doa renders | Add extra doa to `more[]` array |
| Read file with `limit` param then Write | "File has not been read yet" error | Always do full read (no limit) before Write |

---

## 13. How to Continue Adding Content

When asked to add tahun-3 (or any new tahun):

1. **Read** the existing JSON for the same subject in tahun-2 as a structural reference.
2. **Write** new files following the schema above.
3. Use `CardBodyArabic` for any card/callout/funFact that contains Arabic script.
4. Use `CardBodyList` for any card that lists 3+ items.
5. Test at `http://localhost/jais/tahun-3/{subject}/jais-tahun-3-{subject}-bab1`.
6. If the PDF for the bab is image-based (pdfminer yields <1000 chars), rely on curriculum knowledge — the bab topics follow JAIS standard syllabus.

---

*Last updated: 2026-06-29. Covers tahun-1 (all 6 subjects) and tahun-2 (all 6 subjects, 33 bab total).*
