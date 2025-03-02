import { Code } from "lucide-react"

export default function TopBar() {
  return (
    <div className="bg-primary text-primary-foreground h-12 flex items-center justify-between px-4">
      <div className="flex items-center space-x-2">
        <Code className="h-6 w-6" />
        <span className="font-bold text-lg">Hackathon</span>
      </div>
      <div className="text-sm">Admin Dashboard</div>
    </div>
  )
}

