import { useMemo, useState } from 'react'
import { CalendarDays, Clock, ClipboardCheck, Loader2, UserRound, Video } from 'lucide-react'
import { TutorSessionManageFlyout } from '@/components/portal/TutorSessionManageFlyout'
import {
  aggregateStudentSessions,
  assignmentForSession,
  formatClassDate,
  formatClassTimeRange,
  type ClassSession,
  type SubjectClassGroup,
} from '@/lib/student-classes'
import { cn } from '@/lib/utils'

type SessionTab = 'upcoming' | 'past'

export function TodaySessionCard({
  session,
  assignment,
}: {
  session: ClassSession
  assignment: SubjectClassGroup['assignment'] | null
}) {
  const now = Date.now()
  const inProgress = session.startsAt <= now && session.endsAt >= now
  const startsLater = session.startsAt > now

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-crimson/15 bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] p-4 text-white shadow-[0_24px_60px_-28px_rgba(204,0,0,0.45)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Today&apos;s class</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-crimson-light">
            {session.subject}
          </p>
          <h2 className="mt-0.5 truncate text-base font-extrabold tracking-tight">{session.batchName}</h2>
          {assignment ? (
            <p className="mt-0.5 truncate text-xs text-white/55">{assignment.batch.hero_full_name}</p>
          ) : null}
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
            inProgress && 'bg-emerald-400/20 text-emerald-200',
            startsLater && 'bg-white/10 text-white/80',
            !inProgress && !startsLater && 'bg-white/10 text-white/60',
          )}
        >
          {inProgress ? 'In progress' : startsLater ? 'Up next' : 'Today'}
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="rounded-lg bg-white/[0.06] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-white/40">When</p>
          <p className="mt-0.5 text-sm font-bold">{formatClassTimeRange(session.startTime, session.endTime)}</p>
          <p className="text-xs text-white/55">
            {session.weekdayLabel} · {formatClassDate(session.date)}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.06] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Tutor</p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm font-bold">
            <UserRound className="h-3.5 w-3.5 shrink-0 text-crimson-light" />
            {session.tutorName}
          </p>
        </div>
        {assignment ? (
          <div className="rounded-lg bg-white/[0.06] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-white/40">Batch</p>
            <p className="mt-0.5 truncate text-sm font-bold">
              {assignment.batch.syllabus} · {assignment.batch.grade}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-white/55">
              <Clock className="h-3 w-3 shrink-0" />
              {assignment.daysLabel}
            </p>
          </div>
        ) : null}
      </div>

      {session.meetingLink ? (
        <div className="mt-3">
          <a
            href={session.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-[0_12px_32px_-12px_rgba(16,185,129,0.65)] transition-colors hover:bg-emerald-400"
          >
            <Video className="h-4 w-4" />
            Join class
          </a>
        </div>
      ) : null}
    </article>
  )
}

function SessionRow({
  session,
  variant,
  onManage,
}: {
  session: ClassSession
  variant: 'student' | 'tutor'
  onManage?: (session: ClassSession) => void
}) {
  const showManage =
    variant === 'tutor' &&
    session.sessionStatus === 'completed' &&
    session.status === 'past' &&
    onManage

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-charcoal/[0.08] bg-white px-4 py-3.5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-crimson">{session.subject}</p>
        <p className="mt-1 font-semibold text-charcoal">{session.batchName}</p>
        <p className="mt-0.5 text-sm text-charcoal/55">
          {formatClassDate(session.date)} · {session.weekdayLabel} ·{' '}
          {formatClassTimeRange(session.startTime, session.endTime)}
        </p>
        {variant === 'student' && session.status === 'past' && session.attended !== null ? (
          <p className="mt-1 text-xs font-medium text-charcoal/50">
            Attendance: {session.attended ? 'Present' : 'Absent'}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col items-end gap-2">
        {variant === 'student' ? (
          <p className="text-sm text-charcoal/60">
            Tutor: <span className="font-medium text-charcoal/80">{session.tutorName}</span>
          </p>
        ) : null}
        {session.recordingLink ? (
          <a
            href={session.recordingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-2 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(16,185,129,0.7)] transition-colors hover:bg-emerald-400"
          >
            <Video className="h-3.5 w-3.5" />
            Watch Recording
          </a>
        ) : null}
        {showManage ? (
          <button
            type="button"
            onClick={() => onManage(session)}
            className="inline-flex items-center gap-1.5 rounded-full bg-charcoal px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            Mark attendance
          </button>
        ) : null}
      </div>
    </li>
  )
}

function TabbedSessionList({
  sessions,
  emptyLabel,
  variant,
  onManage,
}: {
  sessions: ClassSession[]
  emptyLabel: string
  variant: 'student' | 'tutor'
  onManage?: (session: ClassSession) => void
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, ClassSession[]>()
    for (const session of sessions) {
      const bucket = map.get(session.subject) ?? []
      bucket.push(session)
      map.set(session.subject, bucket)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'en-IN'))
  }, [sessions])

  if (sessions.length === 0) {
    return <p className="px-1 py-8 text-center text-sm text-charcoal/45">{emptyLabel}</p>
  }

  return (
    <div className="space-y-5">
      {grouped.map(([subject, rows]) => (
        <section key={subject}>
          <h3 className="px-1 text-sm font-bold text-charcoal">{subject}</h3>
          <ul className="mt-2 space-y-2">
            {rows.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                variant={variant}
                onManage={onManage}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function StudentClassesPanel({
  subjects,
  awaitingPayment = false,
  variant = 'student',
  onSessionsUpdated,
}: {
  subjects: SubjectClassGroup[]
  awaitingPayment?: boolean
  variant?: 'student' | 'tutor'
  onSessionsUpdated?: () => void
}) {
  const [tab, setTab] = useState<SessionTab>('upcoming')
  const [manageSession, setManageSession] = useState<ClassSession | null>(null)
  const { today, upcoming, past } = useMemo(() => aggregateStudentSessions(subjects), [subjects])

  if (subjects.length === 0) {
    const emptyTitle =
      variant === 'tutor'
        ? 'No batches assigned yet'
        : awaitingPayment
          ? 'Tuition payment required'
          : 'No batches assigned yet'
    const emptyDescription =
      variant === 'tutor'
        ? 'Once operations assigns you to a tuition batch, your teaching sessions will appear here.'
        : awaitingPayment
          ? 'Your batch is ready, but classes appear here only for months you have paid tuition for. Pay the monthly fee to unlock sessions.'
          : 'Once operations allocates you to a tuition batch, your classes will appear here.'

    return (
      <div className="rounded-2xl border border-dashed border-charcoal/15 bg-white px-6 py-16 text-center">
        <CalendarDays className="mx-auto h-8 w-8 text-charcoal/20" />
        <p className="mt-3 font-medium text-charcoal/60">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-charcoal/45">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {today.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {today.map((session) => (
            <TodaySessionCard
              key={session.id}
              session={session}
              assignment={assignmentForSession(subjects, session)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-charcoal/15 bg-white px-6 py-12 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-charcoal/20" />
          <p className="mt-3 font-medium text-charcoal/60">No class scheduled for today</p>
          <p className="mt-1 text-sm text-charcoal/45">Check upcoming sessions below.</p>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white">
        <div className="flex border-b border-charcoal/[0.06]">
          {(
            [
              { id: 'upcoming' as const, label: 'Upcoming Sessions', count: upcoming.length },
              { id: 'past' as const, label: 'Past Sessions', count: past.length },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'flex-1 px-4 py-4 text-base font-bold transition-colors sm:px-6 sm:text-lg',
                tab === item.id
                  ? 'border-b-2 border-crimson bg-crimson/[0.04] text-crimson'
                  : 'text-charcoal/50 hover:bg-charcoal/[0.02] hover:text-charcoal',
              )}
            >
              {item.label}
              <span className="ml-2 rounded-full bg-charcoal/[0.06] px-2 py-0.5 text-sm font-bold text-charcoal/55">
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5">
          {tab === 'upcoming' ? (
            <TabbedSessionList
              sessions={upcoming}
              emptyLabel="No upcoming classes in the next few weeks."
              variant={variant}
              onManage={variant === 'tutor' ? setManageSession : undefined}
            />
          ) : (
            <TabbedSessionList
              sessions={past}
              emptyLabel="No past classes to show yet."
              variant={variant}
              onManage={variant === 'tutor' ? setManageSession : undefined}
            />
          )}
        </div>
      </section>

      <TutorSessionManageFlyout
        open={manageSession !== null}
        batchId={manageSession?.batchId ?? 0}
        sessionDate={manageSession?.date ?? ''}
        batchName={manageSession?.batchName ?? ''}
        startTime={manageSession?.startTime ?? ''}
        endTime={manageSession?.endTime ?? ''}
        onClose={() => setManageSession(null)}
        onSaved={() => onSessionsUpdated?.()}
      />
    </div>
  )
}

export function StudentClassesLoading() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-charcoal/[0.06] bg-white px-6 py-16 text-sm text-charcoal/50">
      <Loader2 className="h-5 w-5 animate-spin text-crimson" />
      Loading your classes…
    </div>
  )
}
