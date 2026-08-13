import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { site, whatsappUrl } from '@/lib/site'
import { useTrial } from '@/context/TrialContext'

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.17 2.09 15.95 2 14.67 2 11.9 2 10 3.66 10 6.7V9.5H7v4h3V22h4v-8.5z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 8.2A3.2 3.2 0 1115.2 12 3.2 3.2 0 0112 15.2zm6.4-8.5a1.2 1.2 0 11-1.2-1.2 1.2 1.2 0 011.2 1.2zM12 2c-2.72 0-3.06.01-4.13.06a6.8 6.8 0 00-4.81 4.81C2.99 8.94 2.98 9.28 2.98 12s.01 3.06.06 4.13a6.8 6.8 0 004.81 4.81c1.07.05 1.41.06 4.13.06s3.06-.01 4.13-.06a6.8 6.8 0 004.81-4.81c.05-1.07.06-1.41.06-4.13s-.01-3.06-.06-4.13a6.8 6.8 0 00-4.81-4.81C15.06 2.01 14.72 2 12 2zm0 1.8c2.67 0 2.99.01 4.04.06a5 5 0 013.5 3.5c.05 1.05.06 1.37.06 4.04s-.01 2.99-.06 4.04a5 5 0 01-3.5 3.5c-1.05.05-1.37.06-4.04.06s-2.99-.01-4.04-.06a5 5 0 01-3.5-3.5c-.05-1.05-.06-1.37-.06-4.04s.01-2.99.06-4.04a5 5 0 013.5-3.5c1.05-.05 1.37-.06 4.04-.06z" />
    </svg>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-block text-sm text-white/70 transition-colors hover:text-white"
    >
      {children}
    </Link>
  )
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-white/90">
      {children}
    </h3>
  )
}

export function Footer() {
  const { openTrial } = useTrial()
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-[#120608] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a060a] via-crimson-dark to-[#0d0406]" />
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-crimson/20 blur-[120px]" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-crimson/15 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* CTA strip */}
        <div className="border-b border-white/10 py-10 md:py-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-crimson-light">
                Get started
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                Get a free assessment — see the difference live
              </p>
              <p className="mt-2 text-sm text-white/60">
                Very small batches for {site.syllabusCoverage}. No commitment required.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => openTrial()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-crimson transition-colors hover:bg-white/90"
              >
                {site.assessmentCta}
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp us
              </a>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 lg:py-16">
          {/* Brand */}
          <div className="lg:col-span-4">
            <img
              src="/images/mg-tuition-logo.png"
              alt={site.name}
              className="h-11 w-auto brightness-0 invert"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              {site.tagline}. Live online classes in very small batches — from {site.legal}.
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-white/40">
              Trusted since 2015 · Kerala &amp; across India
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={site.facebook}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href={site.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2">
            <FooterHeading>Explore</FooterHeading>
            <ul className="space-y-3">
              {site.nav.map((item) => (
                <li key={item.path}>
                  <FooterLink to={item.path}>{item.label}</FooterLink>
                </li>
              ))}
              <li>
                <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
              </li>
            </ul>
          </div>

          {/* Boards */}
          <div className="lg:col-span-2">
            <FooterHeading>Boards</FooterHeading>
            <ul className="space-y-3">
              {site.boards.map((b) => (
                <li key={b.id}>
                  <FooterLink to="/subjects">{b.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <FooterHeading>Contact</FooterHeading>
            <div className="space-y-4">
              <a
                href={site.phoneHref}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-crimson/30">
                  <Phone className="h-4 w-4 text-crimson-light" />
                </span>
                <span className="text-white/85">{site.phoneDisplay}</span>
              </a>
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-crimson/30">
                  <Mail className="h-4 w-4 text-crimson-light" />
                </span>
                <span className="text-white/85">{site.email}</span>
              </a>

              {site.offices.map((office) => (
                <div
                  key={office.id}
                  className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-crimson/30">
                    <MapPin className="h-4 w-4 text-crimson-light" />
                  </span>
                  <div className="text-sm">
                    <p className="font-semibold text-white/90">{office.label}</p>
                    {office.lines.map((line) => (
                      <p key={line} className="mt-0.5 text-white/60">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col items-center justify-between gap-3 text-center text-xs text-white/50 md:flex-row md:text-left">
            <p>
              © {year} {site.legal}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <Link to="/privacy-policy" className="transition-colors hover:text-white/80">
                Privacy Policy
              </Link>
              <span className="hidden text-white/25 md:inline" aria-hidden>
                ·
              </span>
              <Link to="/contact" className="transition-colors hover:text-white/80">
                Contact
              </Link>
              <span className="hidden text-white/25 md:inline" aria-hidden>
                ·
              </span>
              <span>{site.name}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
