import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { site } from '@/lib/site'

const highlights = [
  { label: 'Since', value: '2015' },
  { label: 'Batch size', value: '6–8' },
  { label: 'Hubs', value: 'Kerala' },
]

export function AboutTeaserSection() {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-24 md:px-6 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-crimson/10 blur-[110px]" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-rose-300/20 blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-[32px] shadow-[0_28px_64px_-24px_rgba(45,45,45,0.35)]">
            <img
              src="/images/main-image.jpg"
              alt="Student learning online with a tutor"
              className="aspect-[4/3] h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent" />
          </div>

          <div className="absolute -bottom-5 left-5 right-5 sm:left-auto sm:right-6 sm:w-[240px]">
            <div className="rounded-2xl border border-white/60 bg-white/95 p-5 shadow-[0_20px_40px_-16px_rgba(45,45,45,0.28)] backdrop-blur-md">
              <p className="text-3xl font-extrabold tracking-tight text-crimson">Since 2015</p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-charcoal/55">
                Trusted by families across India &amp; abroad
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="lg:pl-4"
        >
          <p className="section-eyebrow mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Our story
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-charcoal md:text-5xl">
            Born from a parent&apos;s search for{' '}
            <span className="bg-gradient-to-r from-crimson to-[#e63946] bg-clip-text text-transparent">
              better tutoring
            </span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-charcoal/65">
            {site.people.founder.name} founded {site.brand} so no child is left behind because tuition
            was too costly, too crowded, or too far away. From our Kerala hubs in Cherthala and
            Kottayam, we deliver live classes in very small batches for CBSE and ICSE, and
            one-to-one tuition for IGCSE.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-charcoal/[0.06] bg-[#f8fafc] px-3 py-4 text-center"
              >
                <p className="text-xl font-extrabold text-charcoal md:text-2xl">{item.value}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-charcoal/45">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-charcoal/50">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-crimson" />
              Cherthala &amp; Kottayam
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-crimson" />
              Live classes, 6–8 per batch
            </span>
          </div>

          <Link to="/about" className="btn-primary mt-8 inline-flex">
            Read our story
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
