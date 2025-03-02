"use client"

import { Code } from "lucide-react"

export default function TopBar() {
  return (
    <div className="bg-primary text-primary-foreground h-12 flex items-center justify-between px-4 text-right">
      <div className="text-sm">لوحة تحكم المشارك</div>
      <div className="flex items-center space-x-2">
        <span className="font-bold text-lg ml-2">الهاكاثون</span>
        <Code className="h-6 w-6" />
      </div>
    </div>
  )
}
