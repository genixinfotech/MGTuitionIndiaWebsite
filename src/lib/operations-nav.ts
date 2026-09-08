import { Layers, type LucideIcon } from 'lucide-react'

export type OperationsModule = {
  id: string
  label: string
  path: string
  description: string
  icon: LucideIcon
}

export const operationsModules: OperationsModule[] = [
  {
    id: 'operations-batches',
    label: 'Batches',
    path: '/oneview/operations/batches',
    description: 'Prepare batches, view tutors, and allocate enrolled students.',
    icon: Layers,
  },
]

export const operationsModuleChildren = operationsModules.map(({ id, label, path }) => ({
  id,
  label,
  path,
}))

export function operationsModuleForPath(pathname: string) {
  return (
    operationsModules.find(
      (module) => pathname === module.path || pathname.startsWith(`${module.path}/`),
    ) ?? null
  )
}
