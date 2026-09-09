import { jsPDF } from 'jspdf'
import { site } from '@/lib/site'
import { receiptCoverageText } from '@/lib/class-billing'
import { formatReceiptAmount, formatReceiptDate, type TuitionPaymentReceipt } from '@/lib/payments'

const CRIMSON: [number, number, number] = [204, 0, 0]
const CHARCOAL: [number, number, number] = [45, 45, 45]
const MUTED: [number, number, number] = [110, 110, 110]

function wrap(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 6) {
  const lines = doc.splitTextToSize(text, maxWidth) as string[]
  doc.text(lines, x, y)
  return y + lines.length * lineHeight
}

function row(doc: jsPDF, label: string, value: string, y: number, pageWidth: number) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text(label.toUpperCase(), 18, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...CHARCOAL)
  const nextY = wrap(doc, value, 18, y + 6, pageWidth - 36, 5)
  return nextY + 6
}

export function buildPaymentReceiptPdf(receipt: TuitionPaymentReceipt) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const amount = formatReceiptAmount(receipt.amount, receipt.currency)
  const paidAt = formatReceiptDate(receipt.paidAt)
  const coverageLabel = receiptCoverageText({
    coverage: receipt.coverage,
    subjects: receipt.subjects,
    paidAt: receipt.paidAt,
    grade: receipt.studentGrade,
  })
  const period =
    receipt.coverage.length > 0
      ? receipt.coverage.map((line) => `${line.monthLabel} · ${line.classesPaid} classes`).join(', ')
      : coverageLabel

  doc.setFillColor(...CRIMSON)
  doc.rect(0, 0, pageWidth, 42, 'F')
  doc.setFillColor(230, 57, 70)
  doc.circle(pageWidth - 8, 8, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(site.name.toUpperCase(), 18, 16)
  doc.setFontSize(22)
  doc.text('Payment Receipt', 18, 28)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(receipt.receiptNumber, 18, 35)

  let y = 56
  doc.setTextColor(...CHARCOAL)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(amount, 18, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  y = wrap(doc, `${period}  ·  ${paidAt}`, 18, y, pageWidth - 36, 5) + 4

  doc.setDrawColor(...CRIMSON)
  doc.setLineWidth(0.6)
  doc.line(18, y, pageWidth - 18, y)
  y += 12

  y = row(doc, 'Receipt number', receipt.receiptNumber, y, pageWidth)
  y = row(doc, 'Transaction date', paidAt, y, pageWidth)
  y = row(doc, 'Amount paid', amount, y, pageWidth)
  y = row(doc, 'Student', receipt.studentName, y, pageWidth)
  y = row(doc, 'Classes', coverageLabel, y, pageWidth)
  y = row(doc, 'Paid via', receipt.provider === 'stripe' ? 'Stripe' : receipt.provider, y, pageWidth)
  if (receipt.transactionId) {
    y = row(doc, 'Stripe transaction ID', receipt.transactionId, y, pageWidth)
  }
  if (receipt.parentEmail) {
    y = row(doc, 'Billed to', receipt.parentEmail, y, pageWidth)
  }

  y += 6
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(18, y, pageWidth - 36, 22, 3, 3, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  wrap(
    doc,
    `Thank you. This receipt confirms payment to ${site.legal}. Keep it for your records. Admission and class sessions update after a successful payment.`,
    22,
    y + 8,
    pageWidth - 44,
    4.5,
  )

  doc.setFontSize(8)
  doc.setTextColor(160, 160, 160)
  doc.text(`${site.legal}  ·  ${site.email}`, 18, 287)
  doc.text(receipt.receiptNumber, pageWidth - 18, 287, { align: 'right' })

  return doc.output('blob') as Blob
}

export function downloadPaymentReceiptPdf(receipt: TuitionPaymentReceipt) {
  const blob = buildPaymentReceiptPdf(receipt)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `MG-Tuition-Receipt-${receipt.receiptNumber}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
