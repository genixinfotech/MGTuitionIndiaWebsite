import { motion } from 'framer-motion'
import { MapPin, Quote, Sparkles, Star } from 'lucide-react'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    name: 'Ananya R.',
    place: 'Kochi',
    subject: 'CBSE Maths',
    text: 'My daughter went from fearing maths to asking for extra practice. The small-batch format made all the difference.',
    accent: 'crimson',
  },
  {
    name: 'Rajesh K.',
    place: 'Thiruvananthapuram',
    subject: 'IGCSE Maths',
    text: 'Clear updates after every week. We finally knew exactly where our son stood before the board exams.',
    accent: 'indigo',
  },
  {
    name: 'Meera S.',
    place: 'Bengaluru',
    subject: 'ICSE Science',
    text: 'Flexible timings around school and cricket practice. The tutor was patient and syllabus-focused.',
    accent: 'emerald',
  },
  {
    name: 'Farhan A.',
    place: 'Hyderabad',
    subject: 'CBSE Maths',
    text: 'Strong concepts without the coaching-centre chaos. Exactly what we needed in Class 10.',
    accent: 'amber',
  },
] as const

const accents = {
  crimson: {
    bar: 'from-crimson to-[#e63946]',
    avatar: 'from-crimson to-[#e63946]',
    chip: 'bg-rose-50 text-crimson',
    quote: 'text-crimson/15',
  },
  indigo: {
    bar: 'from-indigo-600 to-violet-500',
    avatar: 'from-indigo-600 to-violet-500',
    chip: 'bg-indigo-50 text-indigo-700',
    quote: 'text-indigo-500/15',
  },
  emerald: {
    bar: 'from-emerald-500 to-teal-500',
    avatar: 'from-emerald-500 to-teal-500',
    chip: 'bg-emerald-50 text-emerald-700',
    quote: 'text-emerald-500/15',
  },
  amber: {
    bar: 'from-amber-500 to-orange-500',
    avatar: 'from-amber-500 to-orange-500',
    chip: 'bg-amber-50 text-amber-800',
    quote: 'text-amber-500/20',
  },
} as const

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function Stars() {
  return (
    <div className="flex gap-0.5 text-crimson" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, idx) => (
        <Star key={idx} className="h-3.5 w-3.5 fill-current" />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  const loop = [...testimonials, ...testimonials]

  return (
    <section className="relative overflow-hidden bg-[#f8fafc] py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-crimson/10 blur-[110px]" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-indigo-400/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(204,0,0,0.06),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="section-eyebrow mx-auto mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Parent voices
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-charcoal md:text-5xl">
            Trusted across{' '}
            <span className="bg-gradient-to-r from-crimson to-[#e63946] bg-clip-text text-transparent">
              India
            </span>
          </h2>
          <p className="mt-4 text-lg text-charcoal/55">
            Families from Kochi to Hyderabad — the same small-batch care, the same honest updates.
          </p>

          <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full border border-charcoal/10 bg-white px-5 py-2.5 text-sm text-charcoal/70 shadow-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-charcoal">
              <Stars />
              {site.stats[3].value}
            </span>
            <span className="hidden h-4 w-px bg-charcoal/15 sm:block" aria-hidden />
            <span>
              <span className="font-semibold text-charcoal">{site.stats[2].value}</span> students guided
            </span>
          </div>
        </motion.div>
      </div>

      <div className="relative mx-auto mt-14 max-w-7xl px-4 md:px-6">
        <div className="pointer-events-none absolute inset-y-0 left-4 z-10 w-10 bg-gradient-to-r from-[#f8fafc] to-transparent md:left-6 md:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-4 z-10 w-10 bg-gradient-to-l from-[#f8fafc] to-transparent md:right-6 md:w-16" />

        <div className="overflow-hidden px-2 py-10">
          <div className="testimonials-marquee flex w-max gap-5 hover:[animation-play-state:paused]">
            {loop.map((t, i) => (
              <TestimonialCard
                key={`${t.name}-${i}`}
                testimonial={t}
                ariaHidden={i >= testimonials.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({
  testimonial,
  ariaHidden,
}: {
  testimonial: (typeof testimonials)[number]
  ariaHidden?: boolean
}) {
  const theme = accents[testimonial.accent]

  return (
    <blockquote
      aria-hidden={ariaHidden || undefined}
      className="flex min-h-[280px] w-[calc(100vw-3.5rem)] shrink-0 flex-col rounded-[28px] border border-charcoal/[0.06] bg-white p-7 shadow-[0_20px_48px_-12px_rgba(45,45,45,0.22)] md:w-[calc((min(80rem,100vw)-3rem-1rem-1.25rem)/2)] md:p-9"
    >
      <div className={cn('mb-5 h-1 w-12 rounded-full bg-gradient-to-r', theme.bar)} />
      <Quote className={cn('mb-4 h-8 w-8', theme.quote)} aria-hidden />
      <Stars />
      <p className="mt-4 flex-1 text-base font-medium leading-relaxed text-charcoal/80 md:text-lg">
        &ldquo;{testimonial.text}&rdquo;
      </p>
      <footer className="mt-7 flex items-center gap-3">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md',
            theme.avatar,
          )}
        >
          {initials(testimonial.name)}
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-charcoal">{testimonial.name}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-charcoal/50">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {testimonial.place}
            </span>
            <span
              className={cn(
                'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                theme.chip,
              )}
            >
              {testimonial.subject}
            </span>
          </p>
        </div>
      </footer>
    </blockquote>
  )
}
