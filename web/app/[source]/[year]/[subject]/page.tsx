import { getNotesBySubject, getSubjectMeta } from "@/lib/notes"
import { Source, Year, Subject } from "@/lib/types"
import { ChapterList } from "@/components/dashboard/ChapterList"
import { notFound } from "next/navigation"

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ source: string; year: string; subject: string }>
}) {
  const { source, year, subject } = await params
  const meta = getSubjectMeta(subject as Subject)
  if (!meta) notFound()

  const notes = getNotesBySubject(source as Source, year as Year, subject as Subject)

  return <ChapterList notes={notes} meta={meta} source={source} year={year} subject={subject} />
}
