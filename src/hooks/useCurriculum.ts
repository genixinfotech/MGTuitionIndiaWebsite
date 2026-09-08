import { useEffect, useMemo, useState } from 'react'
import {
  fetchCurriculum,
  gradesForSyllabus,
  listSubjectsForGrade,
  type Curriculum,
} from '@/lib/curriculum'

export function useCurriculum() {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    void fetchCurriculum()
      .then((next) => {
        if (!cancelled) setCurriculum(next)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load curriculum.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const syllabi = useMemo(() => curriculum?.syllabi.map((row) => row.name) ?? [], [curriculum])
  const grades = useMemo(() => curriculum?.grades.map((row) => row.label) ?? [], [curriculum])

  return { curriculum, syllabi, grades, loading, error }
}

export function useGradesForSyllabus(syllabusName?: string | null) {
  const { curriculum, loading, error } = useCurriculum()
  const grades = useMemo(
    () => (curriculum ? gradesForSyllabus(syllabusName, curriculum) : []),
    [curriculum, syllabusName],
  )
  return { grades, loading, error }
}

export function useSubjectsForGrade(gradeLabel?: string | null, syllabusName?: string | null) {
  const [subjects, setSubjects] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!gradeLabel?.trim() || !syllabusName?.trim()) {
      setSubjects([])
      setLoading(false)
      setError('')
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    void listSubjectsForGrade(gradeLabel, syllabusName)
      .then((rows) => {
        if (!cancelled) setSubjects(rows)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load subjects for this grade.')
          setSubjects([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [gradeLabel, syllabusName])

  return { subjects, loading, error }
}
