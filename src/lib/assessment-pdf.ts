import { jsPDF } from 'jspdf'
import { site } from '@/lib/site'
import type { WeakSubjectNote } from '@/lib/database.types'

const CRIMSON: [number, number, number] = [204, 0, 0]
const CHARCOAL: [number, number, number] = [45, 45, 45]
const MUTED: [number, number, number] = [110, 110, 110]

function wrap(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 6) {
  const lines = doc.splitTextToSize(text, maxWidth) as string[]
  doc.text(lines, x, y)
  return y + lines.length * lineHeight
}

export function buildAssessmentPdf(input: {
  studentName: string
  grade: string
  board: string
  school: string
  location: string
  weakSubjects: WeakSubjectNote[]
  recommendation: string
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  doc.setFillColor(...CRIMSON)
  doc.rect(0, 0, pageWidth, 42, 'F')
  doc.setFillColor(230, 57, 70)
  doc.circle(pageWidth - 8, 8, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(site.name.toUpperCase(), 18, 16)
  doc.setFontSize(22)
  doc.text('Assessment Report', 18, 28)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(today, 18, 35)

  let y = 56
  doc.setTextColor(...CHARCOAL)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(input.studentName, 18, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  const meta = [input.grade, input.board, input.school, input.location].filter(Boolean).join('  ·  ')
  y = wrap(doc, meta || 'Student assessment', 18, y, pageWidth - 36, 5) + 4

  doc.setDrawColor(...CRIMSON)
  doc.setLineWidth(0.6)
  doc.line(18, y, pageWidth - 18, y)
  y += 10

  doc.setTextColor(...CRIMSON)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('AREAS THAT NEED SUPPORT', 18, y)
  y += 8

  input.weakSubjects.forEach((item, index) => {
    if (y > 250) {
      doc.addPage()
      y = 24
    }
    doc.setFillColor(252, 246, 246)
    const note = item.note.trim() || 'Additional practice recommended in this subject.'
    const noteLines = doc.splitTextToSize(note, pageWidth - 52) as string[]
    const boxHeight = 14 + noteLines.length * 5
    doc.roundedRect(18, y - 5, pageWidth - 36, boxHeight, 3, 3, 'F')
    doc.setFillColor(...CRIMSON)
    doc.circle(26, y + 1, 3.2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(String(index + 1), 26, y + 2.2, { align: 'center' })
    doc.setTextColor(...CHARCOAL)
    doc.setFontSize(12)
    doc.text(item.subject, 34, y + 2)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text(noteLines, 34, y + 9)
    y += boxHeight + 5
  })

  if (y > 230) {
    doc.addPage()
    y = 24
  }

  y += 4
  doc.setTextColor(...CRIMSON)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('RECOMMENDATION', 18, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...CHARCOAL)
  y = wrap(
    doc,
    input.recommendation.trim() ||
      'We recommend focused small-batch tuition in the subjects above to close the gaps identified in this assessment.',
    18,
    y,
    pageWidth - 36,
    5.5,
  )

  y += 14
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(18, y, pageWidth - 36, 22, 3, 3, 'F')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  wrap(
    doc,
    `Prepared by a Student Consultant at ${site.name}. A consultant will assign the tuition subjects next. Admission is confirmed after payment.`,
    22,
    y + 8,
    pageWidth - 44,
    4.5,
  )

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setFontSize(8)
    doc.setTextColor(160, 160, 160)
    doc.text(`${site.legal}  ·  ${site.email}`, 18, 287)
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - 18, 287, { align: 'right' })
  }

  return doc.output('blob') as Blob
}
