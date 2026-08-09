import { motion } from 'framer-motion'
import { Award, GraduationCap, Star, Users } from 'lucide-react'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

const statStyles = [
  {
    icon: Award,
    gradient: 'from-crimson/20 via-rose-500/10 to-white/40',
    iconBg: 'from-crimson/25 to-rose-400/15',
    iconColor: 'text-crimson',
    valueGradient: 'from-crimson via-rose-500 to-[#e63946]',
    glow: 'shadow-crimson/10',
  },
  {
    icon: GraduationCap,
    gradient: 'from-indigo-500/15 via-violet-500/10 to-white/40',
    iconBg: 'from-indigo-500/25 to-violet-400/15',
    iconColor: 'text-indigo-600',
    valueGradient: 'from-indigo-600 via-violet-600 to-indigo-500',
    glow: 'shadow-indigo-500/10',
  },
  {
    icon: Users,
    gradient: 'from-emerald-500/15 via-teal-500/10 to-white/40',
    iconBg: 'from-emerald-500/25 to-teal-400/15',
    iconColor: 'text-emerald-600',
    valueGradient: 'from-emerald-600 via-teal-600 to-emerald-500',
    glow: 'shadow-emerald-500/10',
  },
  {
    icon: Star,
    gradient: 'from-amber-400/20 via-orange-400/10 to-white/40',
    iconBg: 'from-amber-400/30 to-orange-300/15',
    iconColor: 'text-amber-600',
    valueGradient: 'from-amber-600 via-orange-500 to-amber-500',
    glow: 'shadow-amber-400/10',
  },
] as const

export function StatsSection() {
  return (
    <section className="relative z-10 -mt-10 px-4 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {site.stats.map((stat, i) => {
          const style = statStyles[i] ?? statStyles[0]
          const Icon = style.icon

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className={cn(
                'group relative overflow-hidden rounded-3xl border border-white/60',
                'bg-white/45 shadow-lg backdrop-blur-xl',
                style.glow,
              )}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-90',
                  style.gradient,
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/20" />

              <div className="relative flex flex-col items-center px-5 py-7 text-center">
                <div
                  className={cn(
                    'mb-4 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl',
                    'border border-white/50 bg-gradient-to-br shadow-inner',
                    style.iconBg,
                  )}
                >
                  <Icon className={cn('h-9 w-9', style.iconColor)} strokeWidth={1.75} />
                </div>
                <p className="text-3xl font-extrabold tracking-tight md:text-4xl">
                  <span
                    className={cn(
                      'bg-gradient-to-r bg-clip-text text-transparent',
                      style.valueGradient,
                    )}
                  >
                    {stat.value}
                  </span>
                </p>
                <p className="mt-2 text-sm font-medium text-charcoal/60">{stat.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
