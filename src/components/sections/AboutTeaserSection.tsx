import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { site } from '@/lib/site'

export function AboutTeaserSection() {
  return (
    <section className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="overflow-hidden rounded-3xl">
            <img
              src="/images/main-image.jpg"
              alt="Student learning online with a tutor"
              className="h-full w-full object-cover transition duration-700 hover:scale-105"
            />
          </div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="glass absolute -bottom-4 -right-2 max-w-[220px] rounded-2xl p-4 sm:right-4"
          >
            <p className="text-2xl font-bold text-crimson">Since 2015</p>
            <p className="text-xs text-charcoal/60">Trusted by families across India &amp; abroad</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="section-eyebrow mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Our story
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-charcoal md:text-4xl">
            Born from a parent&apos;s search for better tutoring
          </h2>
          <p className="mt-4 text-charcoal/65 leading-relaxed">
            {site.people.founder.name} founded {site.brand} so no child is left behind because tuition
            was too costly, too crowded, or too far away. From our Kerala hubs in Cherthala and
            Kottayam, we deliver live classes in very small batches tailored to Indian boards.
          </p>
          <Link to="/about" className="btn-primary mt-8 inline-flex">
            Read our story
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
