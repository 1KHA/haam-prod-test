"use client"

import { MilestonesDashboard } from "@/components/milestones/MilestonesDashboard"

export default function ProgramManagerMilestonesPage() {
  return (
    <MilestonesDashboard
      apiBase="/api/program-manager/milestones"
      title="مراحل الشركات الناشئة"
      description="إنشاء ومتابعة المراحل التي تُسند إلى الشركات الناشئة عبر البرنامج."
    />
  )
}
