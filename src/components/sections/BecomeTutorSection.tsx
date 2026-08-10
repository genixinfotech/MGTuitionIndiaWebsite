import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { site } from '@/lib/site'

export function BecomeTutorSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:px-6 md:py-28">
      <div className="absolute inset-0">
        <img
          src="/images/tutor-photo.jpg"
          alt="MG Tuition tutor"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-crimson-dark/95 via-crimson/90 to-crimson/70" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 text-white lg:flex-row lg:items-center lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl"
        >
          <h2 className="text-3xl font-bold md:text-4xl">Teach with MG Tuition India</h2>
          <p className="mt-3 text-white/80">
            Join a growing network of tutors delivering small-batch classes for{' '}
            {site.syllabusCoverage} — with training, scheduling support, and steady student demand.
          </p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link to="/become-tutor" className="btn-ghost !bg-white !text-crimson inline-flex">
            Apply to teach
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
