import { Link } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { PageHero } from '@/components/layout/PageHero'
import { site } from '@/lib/site'

export function PrivacyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description={`Last updated: August 2026 · ${site.legal}`}
      />

      <article className="mx-auto max-w-3xl px-4 pb-20 pt-12 md:px-6">
        <div className="space-y-6 text-sm leading-relaxed text-charcoal/75">
          <p>
            {site.legal} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates {site.name}. This policy
            explains how we collect, use, and protect personal information when you use our website
            or enquire about our tutoring services in India.
          </p>

          <h2 className="text-xl font-bold text-charcoal">Information we collect</h2>
          <p>
            When you request an assessment, contact us, or apply as a tutor, we may collect your name, email
            address, phone number, board/subject preferences, and any message you send. We also
            collect basic technical data such as browser type and pages visited via standard web
            logs.
          </p>

          <h2 className="text-xl font-bold text-charcoal">How we use information</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>To respond to enquiries and schedule assessments or paid sessions</li>
            <li>To match students with suitable tutors</li>
            <li>To process tutor applications</li>
            <li>To improve our website and services</li>
            <li>To meet legal or regulatory obligations</li>
          </ul>

          <h2 className="text-xl font-bold text-charcoal">Sharing</h2>
          <p>
            We do not sell your personal data. We may share information with tutors or staff involved
            in delivering your classes, and with service providers who help us operate email or
            hosting — under confidentiality obligations.
          </p>

          <h2 className="text-xl font-bold text-charcoal">Retention &amp; security</h2>
          <p>
            We retain enquiry and student records only as long as needed for tutoring, support, and
            legal requirements. We use reasonable administrative and technical measures to protect
            data, though no method of transmission over the internet is fully secure.
          </p>

          <h2 className="text-xl font-bold text-charcoal">Your rights</h2>
          <p>
            You may request access, correction, or deletion of your personal information by emailing{' '}
            <a className="font-medium text-crimson hover:underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            . We will respond within a reasonable timeframe under applicable Indian law.
          </p>

          <h2 className="text-xl font-bold text-charcoal">Children</h2>
          <p>
            Our services are aimed at school-age students. Parents or guardians should submit
            enquiries on behalf of minors. We do not knowingly collect data from children without
            parental involvement.
          </p>

          <h2 className="text-xl font-bold text-charcoal">Contact</h2>
          <p>
            For privacy questions: {site.email}
            <br />
            {site.offices[0].lines.join(', ')}
          </p>

          <p>
            <Link to="/" className="font-medium text-crimson hover:underline">
              Return home
            </Link>
          </p>
        </div>
      </article>
    </PageShell>
  )
}
