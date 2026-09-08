import { useRef } from 'react'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import {
  ParentStudentActionButtons,
  ParentStudentsPanel,
  type ParentStudentsPanelHandle,
} from '@/components/portal/ParentStudentsPanel'

export function PortalStudentsPage() {
  const studentsPanelRef = useRef<ParentStudentsPanelHandle>(null)

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <DashboardPageHeader title="Students">
        <ParentStudentActionButtons
          onEnrol={() => studentsPanelRef.current?.openEnrolPanel()}
        />
      </DashboardPageHeader>

      <ParentStudentsPanel ref={studentsPanelRef} />
    </div>
  )
}
