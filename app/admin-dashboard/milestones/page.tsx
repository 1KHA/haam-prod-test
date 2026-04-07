"use client"

import { MilestonesDashboard } from "@/components/milestones/MilestonesDashboard"

export default function AdminMilestonesPage() {
  return (
    <MilestonesDashboard
      apiBase="/api/admin/milestones"
      title="إشراف المراحل"
      description="رؤية إدارية مركزية على جميع مراحل الشركات الناشئة عبر النظام."
    />
  )
}
