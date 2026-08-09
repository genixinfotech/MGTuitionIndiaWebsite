import { motion } from 'framer-motion'
import { Quote, Sparkles, Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Ananya R.',
    place: 'Kochi',
    subject: 'CBSE Maths',
    text: 'My daughter went from fearing maths to asking for extra practice. The small-batch format made all the difference.',
  },
  {
    name: 'Rajesh K.',
    place: 'Thiruvananthapuram',
    subject: 'Kerala SSLC',
    text: 'Clear updates after every week. We finally knew exactly where our son stood before the board exams.',
  },
  {
    name: 'Meera S.',
    place: 'Bengaluru',
    subject: 'ICSE Science',
    text: 'Flexible timings around school and cricket practice. The tutor was patient and syllabus-focused.',
  },
  {
    name: 'Farhan A.',
    place: 'Hyderabad',
    subject: 'CBSE Maths',
    text: 'Strong concepts without the coaching-centre chaos. Exactly what we needed in Class 10.',
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-section-soft px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="section-eyebrow mx-auto mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Parent voices
          </p>
          <h2 className="text-3xl font-bold text-charcoal md:text-4xl">Trusted across India</h2>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="glass relative rounded-2xl p-6"
            >
              <Quote className="absolute right-5 top-5 h-8 w-8 text-crimson/15" />
              <div className="mb-3 flex gap-0.5 text-crimson">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-charcoal/75">&ldquo;{t.text}&rdquo;</p>
              <footer className="mt-4">
                <p className="font-semibold text-charcoal">{t.name}</p>
                <p className="text-xs text-charcoal/50">
                  {t.place} · {t.subject}
                </p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
