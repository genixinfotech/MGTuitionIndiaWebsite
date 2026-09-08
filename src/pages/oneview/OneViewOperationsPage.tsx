import { Link } from 'react-router-dom'
import { ArrowUpRight, Construction, Workflow } from 'lucide-react'
import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'
import { operationsModules } from '@/lib/operations-nav'

export function OneViewOperationsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader title="Operations" icon={Workflow} />

      <div className="rounded-2xl border border-charcoal/[0.06] bg-white px-6 py-8 md:px-8">
        <p className="max-w-2xl text-sm leading-relaxed text-charcoal/55">
          The operations hub for running tuition day-to-day — prepare batches, assign tutors at
          creation, and allocate students from each batch accordion.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {operationsModules.map((module) => {
          const Icon = module.icon
          return (
            <Link
              key={module.id}
              to={module.path}
              className="group rounded-2xl border border-charcoal/[0.06] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-crimson/15 hover:shadow-[0_18px_44px_-28px_rgba(204,0,0,0.25)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-crimson/10 text-crimson">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-charcoal/25 transition group-hover:text-crimson" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-charcoal">{module.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/55">{module.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function OneViewOperationsModulePage({ moduleId }: { moduleId: string }) {
  const module = operationsModules.find((item) => item.id === moduleId)
  if (!module) return null

  const Icon = module.icon

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader title={module.label} icon={Icon} />

      <div className="rounded-2xl border border-dashed border-charcoal/15 bg-white px-6 py-16 text-center md:px-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-crimson/[0.08] text-crimson">
          <Construction className="h-7 w-7" />
        </div>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-charcoal/55">
          {module.description} This module will be built out next as part of the Operations hub.
        </p>
        <Link
          to="/oneview/operations"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-crimson hover:text-crimson-dark"
        >
          Back to Operations
        </Link>
      </div>
    </div>
  )
}
