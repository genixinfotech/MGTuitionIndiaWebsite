import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Sparkles,
  Users,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { HeroHighlight, PageHero } from '@/components/layout/PageHero'
import { FormDisclaimer } from '@/components/forms/FormDisclaimer'
import { FormSuccess } from '@/components/forms/FormSuccess'
import { submitTutor } from '@/lib/email'
import { site } from '@/lib/site'
import { getTuitionConfig } from '@/lib/region'
import { cn } from '@/lib/utils'

const { minEnrolmentGrade } = getTuitionConfig()

const perks = [
  {
    icon: Clock,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white',
    lightColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Flexible hours',
    description: 'Teach from home on a schedule that works for you — mornings, evenings, or weekends.',
  },
  {
    icon: Users,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white',
    lightColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'Steady student demand',
    description: `CBSE & ICSE small batches from Class ${minEnrolmentGrade} upward, plus IGCSE one-to-one.`,
  },
  {
    icon: GraduationCap,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-violet-50 via-purple-50/50 to-white',
    lightColor: 'bg-violet-100',
    iconColor: 'text-violet-600',
    title: 'Training & support',
    description: 'Onboarding, quality checks, and guidance from the IdealMG Educare team.',
  },
  {
    icon: BookOpen,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-gradient-to-br from-amber-50 via-orange-50/50 to-white',
    lightColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'Subjects in demand',
    description: `Maths, Science, English, and Social Science — matched to ${site.syllabusCoverage} syllabi.`,
  },
] as const

const steps = [
  { step: '01', title: 'Apply online', text: 'Share your subjects, experience, and availability.' },
  { step: '02', title: 'Demo & interview', text: 'A short conversation and sample session with our team.' },
  { step: '03', title: 'Start teaching', text: 'Get matched to small batches and begin live classes.' },
] as const

export function BecomeTutorPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subjects: '',
    experience: '',
    message: '',
  })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('loading')
    try {
      await submitTutor(form)
      setStatus('done')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Unable to send. Please try again.')
    }
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Careers"
        title={
          <>
            Become a <HeroHighlight>tutor</HeroHighlight>
          </>
        }
        description="Teach online in very small batches for CBSE and ICSE, and one-to-one for IGCSE. We look for subject mastery, patience, and reliable internet."
      />

      {/* Why join */}
      <section className="relative overflow-hidden bg-[#f8fafc] px-4 py-16 md:px-6 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-400/10 blur-[100px]" />
          <div className="absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-violet-400/10 blur-[100px]" />
          <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-crimson/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="section-eyebrow mx-auto mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Why join us
            </p>
            <h2 className="text-3xl font-extrabold text-charcoal md:text-4xl">Why tutors join us</h2>
            <p className="mt-3 text-charcoal/55">
              Share your expertise from home — with training, scheduling support, and meaningful
              student impact.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((perk, i) => {
              const Icon = perk.icon
              return (
                <motion.article
                  key={perk.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    'group relative overflow-hidden rounded-3xl border border-white/60 p-6 shadow-lg backdrop-blur-sm',
                    perk.bgColor,
                  )}
                >
                  <div
                    className={cn(
                      'absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-bl-full bg-gradient-to-br opacity-10',
                      perk.color,
                    )}
                  />
                  <div className="relative mb-4">
                    <div
                      className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md',
                        perk.color,
                      )}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div
                      className={cn(
                        'absolute -bottom-1 left-10 h-6 w-6 -rotate-12 rounded-md',
                        perk.lightColor,
                      )}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-charcoal">{perk.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{perk.description}</p>
                </motion.article>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 rounded-[28px] border border-charcoal/[0.06] bg-white p-8 shadow-lg md:p-10"
          >
            <div className="mx-auto max-w-2xl text-center">
              <p className="section-eyebrow mx-auto mb-4">
                <Award className="h-3.5 w-3.5" />
                How it works
              </p>
              <h3 className="text-2xl font-bold text-charcoal md:text-3xl">Three steps to start teaching</h3>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative rounded-2xl bg-slate-50 p-6 text-center"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-crimson to-[#e63946] text-sm font-bold text-white shadow-md shadow-crimson/20">
                    {item.step}
                  </span>
                  <h4 className="mt-4 text-lg font-bold text-charcoal">{item.title}</h4>
                  <p className="mt-2 text-sm text-charcoal/60">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Application form */}
      <section className="relative bg-white px-4 pb-24 pt-4 md:px-6 md:pb-32 md:pt-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[28px] bg-white shadow-[0_24px_64px_-12px_rgba(0,0,0,0.12)] ring-1 ring-charcoal/[0.06] lg:grid lg:grid-cols-2"
          >
            <div className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[620px]">
              <img
                src="/images/tutor-photo.jpg"
                alt="MG Tuition tutor"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/95 via-charcoal/85 to-transparent px-8 pb-8 pt-20 text-white md:px-10 md:pb-10 md:pt-24">
                <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-crimson-light" />
                  Join our faculty
                </p>
                <h2 className="mt-4 max-w-sm text-3xl font-extrabold leading-tight md:text-4xl">
                  Inspire the next generation of learners
                </h2>
                <ul className="mt-6 space-y-3">
                  {[
                    'Very small batches — real impact per student',
                    'CBSE & ICSE batches, plus IGCSE one-to-one',
                    'Support from Cherthala & Kottayam hubs',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-sm text-white/90">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-crimson-light" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <motion.form
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onSubmit={onSubmit}
              className="flex flex-col justify-center bg-gradient-to-br from-white to-slate-50/80 p-8 md:p-10 lg:p-12"
            >
              <div className="mb-4">
                <p className="section-eyebrow mb-3 w-fit">Application</p>
                <h2 className="text-2xl font-bold text-charcoal md:text-3xl">Apply to teach</h2>
                <p className="mt-2 text-sm text-charcoal/55">
                  Fill in your details — we&apos;ll get back to you within a few working days.
                </p>
              </div>

              {status === 'done' ? (
                <FormSuccess
                  title="Application sent successfully"
                  description="We’ve received your tutor application and will get back to you within a few working days."
                  actionLabel="Submit another application"
                  onAction={() => {
                    setStatus('idle')
                    setForm({
                      name: '',
                      email: '',
                      phone: '',
                      subjects: '',
                      experience: '',
                      message: '',
                    })
                  }}
                />
              ) : (
                <>
              <div className="space-y-3">
                <input
                  required
                  className="input-field"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <input
                  required
                  type="email"
                  className="input-field"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
                <input
                  required
                  type="tel"
                  className="input-field"
                  placeholder="Phone (WhatsApp preferred)"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
                <input
                  required
                  className="input-field"
                  placeholder="Subjects you teach"
                  value={form.subjects}
                  onChange={(e) => setForm((f) => ({ ...f, subjects: e.target.value }))}
                />
                <input
                  required
                  className="input-field"
                  placeholder="Years of experience"
                  value={form.experience}
                  onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                />
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Tell us about your teaching background (optional)"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>

              {error ? (
                <p className="mt-4 rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={status !== 'idle'} className="btn-primary mt-6 w-full">
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  'Submit application'
                )}
              </button>
                </>
              )}
              <div className="mt-6">
                <FormDisclaimer />
              </div>
            </motion.form>
          </motion.div>
        </div>
      </section>
    </PageShell>
  )
}
