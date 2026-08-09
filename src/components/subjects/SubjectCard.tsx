import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { subjectDetails, subjectIcons, type SubjectName } from '@/lib/subjects'
import { cn } from '@/lib/utils'

type SubjectCardProps = {
  subject: SubjectName
  index?: number
  learnMoreHref?: string | false
}

export function SubjectCard({ subject, index = 0, learnMoreHref = '/subjects' }: SubjectCardProps) {
  const style = subjectDetails[subject]
  const Icon = subjectIcons[subject]

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 shadow-xl shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl md:p-8',
        style.bgColor,
      )}
    >
      <div
        className={cn(
          'absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-bl-full bg-gradient-to-br opacity-10 transition-transform duration-500 group-hover:scale-150',
          style.color,
        )}
      />

      <div className="relative mb-6">
        <div
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:rotate-3 group-hover:scale-110',
            style.color,
          )}
        >
          <Icon className="h-10 w-10 text-white" />
        </div>
        <div
          className={cn(
            'absolute -bottom-2 -right-2 h-8 w-8 -rotate-12 rounded-lg',
            style.lightColor,
          )}
        />
      </div>

      <h4 className="text-2xl font-bold text-charcoal transition-colors group-hover:text-crimson">
        {subject}
      </h4>
      <p
        className={cn(
          'mt-2 inline-block rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white',
          style.color,
        )}
      >
        {style.level}
      </p>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-charcoal/60">{style.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {style.features.map((feature) => (
          <span
            key={feature}
            className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-charcoal/70 shadow-sm"
          >
            {feature}
          </span>
        ))}
      </div>

      {learnMoreHref ? (
        <Link
          to={learnMoreHref}
          className="mt-6 inline-flex items-center text-sm font-semibold text-crimson transition-all group-hover:gap-3"
        >
          Learn more
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : null}
    </motion.article>
  )
}
