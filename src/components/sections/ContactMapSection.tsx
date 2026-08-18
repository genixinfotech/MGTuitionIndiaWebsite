import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Sparkles } from 'lucide-react'
import { site, whatsappUrl } from '@/lib/site'
import { useTrial } from '@/context/TrialContext'

export function ContactMapSection() {
  const { openTrial } = useTrial()
  const hasWhatsapp = Boolean(site.whatsappNumber)

  return (
    <section className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="section-eyebrow mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Visit &amp; reach us
          </p>
          <h2 className="text-3xl font-bold text-charcoal md:text-4xl">{site.contactSectionTitle}</h2>
          <p className="mt-3 text-charcoal/60">{site.contactSectionDescription}</p>

          <div className="mt-8 space-y-4">
            {site.offices.map((office) => (
              <div
                key={office.id}
                className="glass flex gap-3 rounded-2xl p-4 transition hover:-translate-y-1 hover:shadow-glass-lg"
              >
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-crimson" />
                <div>
                  <p className="font-semibold text-charcoal">{office.label}</p>
                  {office.lines.map((line) => (
                    <p key={line} className="text-sm text-charcoal/60">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {site.showPhone && site.phoneDisplay ? (
              <a
                href={site.phoneHref}
                className="glass flex items-center gap-3 rounded-2xl p-4 transition hover:-translate-y-1 hover:shadow-glass-lg"
              >
                <Phone className="h-5 w-5 text-crimson" />
                <span className="font-medium">{site.phoneDisplay}</span>
              </a>
            ) : null}
            <a
              href={`mailto:${site.email}`}
              className="glass flex items-center gap-3 rounded-2xl p-4 transition hover:-translate-y-1 hover:shadow-glass-lg"
            >
              <Mail className="h-5 w-5 text-crimson" />
              <span className="font-medium">{site.email}</span>
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => openTrial()} className="btn-primary">
              {site.assessmentCta}
            </button>
            {hasWhatsapp ? (
              <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="btn-outline">
                WhatsApp us
              </a>
            ) : null}
          </div>
        </motion.div>

        {site.mapEmbed ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-3xl shadow-glass-lg"
          >
            <iframe
              title={`${site.legal} map`}
              src={site.mapEmbed}
              className="h-[420px] w-full border-0 lg:h-full min-h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex min-h-[420px] items-center justify-center rounded-3xl border border-charcoal/10 bg-gradient-to-br from-crimson/[0.06] to-white p-10 shadow-glass-lg"
          >
            <div className="max-w-sm text-center">
              <MapPin className="mx-auto h-10 w-10 text-crimson" />
              <p className="mt-4 text-lg font-bold text-charcoal">{site.legal}</p>
              <p className="mt-2 text-sm text-charcoal/60">
                Full office address and map will be published here soon.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
