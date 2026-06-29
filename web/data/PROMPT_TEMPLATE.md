# Prompt Template — Guna di Claude.ai

Untuk setiap fail .txt dalam folder `extracted/`, buat satu perbualan baru di claude.ai dan paste prompt di bawah.

Ganti bahagian dalam [ ] dan paste teks dari fail .txt.

---

## TEMPLATE (copy semua ni)

```
Kamu adalah pereka kurikulum yang membuat nota belajar menarik untuk kanak-kanak Muslim berumur 7-12 tahun di Malaysia. Tulis dalam Bahasa Melayu yang mudah dan menyeronokkan.

Berikut adalah teks daripada buku teks [SUBJEK] [TAHUN] JAIS:

[PASTE KANDUNGAN FAIL .TXT DI SINI]

Tukarkan kandungan ini kepada JSON nota. Balas dengan JSON SAHAJA, tiada teks lain di luar JSON.

Gunakan format TEPAT ini:

{
  "id": "[SOURCE]-[YEAR]-[SUBJECT]-bab1",
  "source": "[SOURCE]",
  "year": "[YEAR]",
  "subject": "[SUBJECT]",
  "chapter": 1,
  "title": "<tajuk menarik untuk bab ini>",
  "emoji": "<1 emoji sesuai>",
  "colour": "[COLOUR]",
  "estimatedMinutes": 10,
  "sections": [
    { "type": "intro", "heading": "<tajuk>", "body": "<2-3 ayat mudah>" },
    { "type": "concept-cards", "items": [
      { "icon": "<emoji>", "title": "<konsep>", "body": "<1-2 ayat>" },
      { "icon": "<emoji>", "title": "<konsep>", "body": "<1-2 ayat>" },
      { "icon": "<emoji>", "title": "<konsep>", "body": "<1-2 ayat>" }
    ]},
    { "type": "callout", "icon": "💡", "text": "<fakta menarik>" },
    { "type": "steps", "heading": "<tajuk>", "items": ["<langkah 1>", "<langkah 2>", "<langkah 3>"] }
  ],
  "quiz": [
    { "q": "<soalan>", "options": ["<a>", "<b>", "<c>", "<d>"], "answer": 0 },
    { "q": "<soalan>", "options": ["<a>", "<b>", "<c>", "<d>"], "answer": 1 },
    { "q": "<soalan>", "options": ["<a>", "<b>", "<c>", "<d>"], "answer": 2 },
    { "q": "<soalan>", "options": ["<a>", "<b>", "<c>", "<d>"], "answer": 0 }
  ],
  "graph": {
    "nodes": [
      { "id": "n1", "label": "<konsep>", "colour": "[COLOUR]" },
      { "id": "n2", "label": "<konsep>", "colour": "[COLOUR]" },
      { "id": "n3", "label": "<konsep>", "colour": "[COLOUR]" },
      { "id": "n4", "label": "<konsep>", "colour": "[COLOUR]" },
      { "id": "n5", "label": "<konsep>", "colour": "[COLOUR]" }
    ],
    "edges": [
      { "id": "e1", "source": "n1", "target": "n2", "label": "<hubungan>" },
      { "id": "e2", "source": "n1", "target": "n3", "label": "<hubungan>" },
      { "id": "e3", "source": "n2", "target": "n4", "label": "<hubungan>" },
      { "id": "e4", "source": "n3", "target": "n5", "label": "<hubungan>" }
    ]
  },
  "vocab": [
    { "word": "<perkataan>", "meaning": "<maksud mudah>" },
    { "word": "<perkataan>", "meaning": "<maksud mudah>" },
    { "word": "<perkataan>", "meaning": "<maksud mudah>" }
  ],
  "funFact": "<fakta fun dalam 1-2 ayat>"
}
```

---

## Nilai untuk ganti [PLACEHOLDER]

| Fail .txt | SOURCE | YEAR | SUBJECT | COLOUR |
|-----------|--------|------|---------|--------|
| jais-tahun-1-akhlak.txt | jais | tahun-1 | akhlak | #4CAF50 |
| jais-tahun-1-bahasa-arab.txt | jais | tahun-1 | bahasa-arab | #2196F3 |
| jais-tahun-1-feqah.txt | jais | tahun-1 | feqah | #9C27B0 |
| jais-tahun-1-jawi.txt | jais | tahun-1 | jawi | #FF9800 |
| jais-tahun-1-hafazan.txt | jais | tahun-1 | hafazan | #E91E63 |
| jais-tahun-1-tauhid.txt | jais | tahun-1 | tauhid | #FFB300 |
| jais-tahun-2-akhlak.txt | jais | tahun-2 | akhlak | #4CAF50 |
| jais-tahun-2-bahasa-arab.txt | jais | tahun-2 | bahasa-arab | #2196F3 |
| jais-tahun-2-feqah.txt | jais | tahun-2 | feqah | #9C27B0 |
| jais-tahun-2-jawi.txt | jais | tahun-2 | jawi | #FF9800 |
| jais-tahun-2-hafazan.txt | jais | tahun-2 | hafazan | #E91E63 |
| jais-tahun-2-tauhid.txt | jais | tahun-2 | tauhid | #FFB300 |

---

## Selepas dapat JSON dari Claude.ai

Simpan fail JSON dalam folder:
`web/data/notes/[id].json`

Contoh: output dengan id `jais-tahun-1-akhlak-bab1` → simpan sebagai `web/data/notes/jais-tahun-1-akhlak-bab1.json`

---

## ⚠️ PDF yang perlu perhatian

| Fail | Masalah |
|------|---------|
| jais-tahun-1-akhlak.txt | Teks sangat sedikit (2427 chars) — mungkin ada gambar. Buat nota dari apa yang ada. |
| jais-tahun-1-feqah.txt | Hampir tiada teks (272 chars) — buat nota ringkas atau tulis manual. |
| jais-tahun-2-feqah.txt | Sama — hampir tiada teks. |
| jais-tahun-1-hafazan.txt | TIADA TEKS langsung — PDF gambar sahaja. Tulis nota hafazan manual. |
| jais-tahun-2-hafazan.txt | Sama — tiada teks. |
