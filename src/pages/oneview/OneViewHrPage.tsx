import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'

export function OneViewHrPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader />

      <div className="rounded-2xl border border-charcoal/[0.06] bg-white px-6 py-10 md:px-8">
        <p className="max-w-xl text-sm leading-relaxed text-charcoal/55">
          HR tools for hiring and onboarding tutors. Use the sidebar to open Tutor Enquiries and
          review applications from the website.
        </p>
      </div>
    </div>
  )
}
