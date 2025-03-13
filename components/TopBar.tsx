"use client"

export default function TopBar() {
  return (
    <div className="bg-primary text-primary-foreground h-12 flex items-center justify-between px-4">
      <div className="text-sm">لوحة التحكم</div>
      <div className="flex items-center space-x-2">
        <span className="font-bold text-lg">منصة دِيَم</span>
      </div>
    </div>
  )
}
