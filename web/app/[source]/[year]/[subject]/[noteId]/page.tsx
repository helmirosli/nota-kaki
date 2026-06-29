import { getNoteById, getNotesBySubject, getSubjectMeta } from "@/lib/notes"
import { Source, Year, Subject } from "@/lib/types"
import { NoteReader } from "@/components/notes/NoteReader"
import { notFound } from "next/navigation"

export default async function NotePage({
  params,
}: {
  params: Promise<{ source: string; year: string; subject: string; noteId: string }>
}) {
  const { source, year, subject, noteId } = await params
  const note = getNoteById(noteId)
  if (!note) notFound()

  const allNotes = getNotesBySubject(source as Source, year as Year, subject as Subject)
  const currentIndex = allNotes.findIndex((n) => n.id === noteId)
  const prevNote = allNotes[currentIndex - 1] ?? null
  const nextNote = allNotes[currentIndex + 1] ?? null
  const meta = getSubjectMeta(subject as Subject)
  if (!meta) notFound()

  return (
    <NoteReader
      note={note}
      meta={meta}
      prevNote={prevNote}
      nextNote={nextNote}
      source={source}
      year={year}
      subject={subject}
    />
  )
}
