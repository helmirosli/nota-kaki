import { Note, Subject, Year, Source, SubjectMeta, SUBJECTS } from "./types"
import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data", "notes")

export function getAllNotes(): Note[] {
  if (!fs.existsSync(DATA_DIR)) return []
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf-8")) as Note)
    .sort((a, b) => a.chapter - b.chapter)
}

export function getNotesBySubject(source: Source, year: Year, subject: Subject): Note[] {
  return getAllNotes().filter(
    (n) => n.source === source && n.year === year && n.subject === subject
  )
}

export function getNoteById(id: string): Note | null {
  const file = path.join(DATA_DIR, `${id}.json`)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, "utf-8")) as Note
}

export function getSubjectMeta(subject: Subject): SubjectMeta | undefined {
  return SUBJECTS.find((s) => s.id === subject)
}

export function getAvailableYears(source: Source): Year[] {
  const notes = getAllNotes().filter((n) => n.source === source)
  return [...new Set(notes.map((n) => n.year))].sort()
}

export function getAvailableSubjects(source: Source, year: Year): Subject[] {
  const notes = getAllNotes().filter((n) => n.source === source && n.year === year)
  return [...new Set(notes.map((n) => n.subject))]
}
