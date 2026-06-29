import { getAvailableSubjects, getNotesBySubject } from "@/lib/notes"
import { Source, Year, Subject, SUBJECTS } from "@/lib/types"
import { SubjectGrid } from "@/components/dashboard/SubjectGrid"

export default async function YearPage({
  params,
}: {
  params: Promise<{ source: string; year: string }>
}) {
  const { source, year } = await params
  const subjects = getAvailableSubjects(source as Source, year as Year)

  // If no notes generated yet, show all subjects as placeholders
  const displaySubjects = subjects.length > 0 ? subjects : SUBJECTS.map((s) => s.id)

  // Pass note IDs per subject so client can calculate progress
  const noteIdsBySubject: Record<string, string[]> = {}
  for (const subjectId of displaySubjects) {
    const notes = getNotesBySubject(source as Source, year as Year, subjectId as Subject)
    noteIdsBySubject[subjectId] = notes.map((n) => n.id)
  }

  return (
    <SubjectGrid
      source={source as Source}
      year={year as Year}
      subjects={displaySubjects}
      noteIdsBySubject={noteIdsBySubject}
    />
  )
}
