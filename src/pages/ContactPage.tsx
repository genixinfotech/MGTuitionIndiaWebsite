import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Mail, MapPin, Phone } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { HeroHighlight, PageHero } from '@/components/layout/PageHero'
import { submitContact } from '@/lib/email'
import { site, whatsappUrl } from '@/lib/site'

export function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    await submitContact(form)
    setStatus('done')
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            We&apos;d love to <HeroHighlight>hear from you</HeroHighlight>
          </>
        }
        description="Questions about boards, scheduling, or assessments — send a message or WhatsApp us."
      />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pt-12 pb-20 lg:grid-cols-2 md:px-6">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={onSubmit}
          className="glass space-y-3 rounded-3xl p-6 md:p-8"
        >
          <h2 className="text-xl font-bold text-charcoal">Send a message</h2>
          <input
            required
            className="input-field"
            placeholder="Your name"
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
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <textarea
            required
            className="input-field min-h-[120px] resize-none"
            placeholder="How can we help?"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          />
          <button type="submit" disabled={status !== 'idle'} className="btn-primary w-full">
            {status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : status === 'done' ? (
              'Opening email…'
            ) : (
              'Send message'
            )}
          </button>
          <a
            href={whatsappUrl('Hi, I have a question about MG Tuition India.')}
            target="_blank"
            rel="noreferrer"
            className="btn-outline w-full"
          >
            Or chat on WhatsApp
          </a>
        </motion.form>

        <div className="space-y-4">
          {site.offices.map((office) => (
            <motion.div
              key={office.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-crimson" />
                <div>
                  <p className="font-semibold text-charcoal">{office.label}</p>
                  {office.lines.map((line) => (
                    <p key={line} className="text-sm text-charcoal/60">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
          <a
            href={site.phoneHref}
            className="glass flex items-center gap-3 rounded-2xl p-5 transition hover:-translate-y-1"
          >
            <Phone className="h-5 w-5 text-crimson" />
            <span className="font-medium">{site.phoneDisplay}</span>
          </a>
          <a
            href={`mailto:${site.email}`}
            className="glass flex items-center gap-3 rounded-2xl p-5 transition hover:-translate-y-1"
          >
            <Mail className="h-5 w-5 text-crimson" />
            <span className="font-medium">{site.email}</span>
          </a>
          <div className="overflow-hidden rounded-2xl shadow-glass">
            <iframe
              title="Office map"
              src={site.mapEmbed}
              className="h-64 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </PageShell>
  )
}
