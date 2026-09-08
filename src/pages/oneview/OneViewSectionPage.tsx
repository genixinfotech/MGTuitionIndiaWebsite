import { useLocation } from 'react-router-dom'
import { Construction } from 'lucide-react'
import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'
import { oneViewNavItemForPath } from '@/lib/oneview-nav'

export function OneViewSectionPage() {
  const { pathname } = useLocation()
  const section = oneViewNavItemForPath(pathname)

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader title={section.label} icon={section.icon} />

      <div className="rounded-2xl border border-dashed border-charcoal/15 bg-white px-6 py-16 text-center md:px-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-crimson/[0.08] text-crimson">
          <Construction className="h-7 w-7" />
        </div>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-charcoal/55">
          This section is scaffolded in OneView and will be built out next. Access is already mapped
          to the relevant roles — only superadmin can reach OneView for now.
        </p>
      </div>
    </div>
  )
}
