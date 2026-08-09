import { motion } from 'framer-motion'
import { ClipboardCheck, LineChart, Sparkles, Target, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  {
    icon: ClipboardCheck,
    title: 'Assess',
    text: 'We map strengths, gaps, and board syllabus so every plan starts from real data.',
  },
  {
    icon: Target,
    title: 'Plan',
    text: 'A clear weekly path with goals your child — and you — can understand.',
  },
  {
    icon: Users,
    title: 'Teach',
    text: 'Live sessions in very small batches with tutors trained for Indian curricula.',
  },
  {
    icon: LineChart,
    title: 'Track',
    text: 'Progress updates and adjustments so momentum never stalls.',
  },
]

export function WhyUsSection() {
  return (
    <section className="bg-charcoal px-4 py-20 text-white md:px-6 md:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-crimson-light">
            <Sparkles className="h-3.5 w-3.5" />
            Why choose us
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">A method parents can trust</h2>
          <p className="mt-3 text-white/60">
            Assess → Plan → Teach → Track. Simple, transparent, and built around your child.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass-dark rounded-2xl p-6"
            >
              <step.icon className="mb-4 h-8 w-8 text-crimson-light" />
              <h3 className="text-lg font-bold">
                <span className="mr-2 text-crimson-light">0{i + 1}</span>
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{step.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/why-choose-us" className="btn-ghost">
            See why families stay
          </Link>
        </div>
      </div>
    </section>
  )
}
