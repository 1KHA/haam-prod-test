"use client"

import { ReactNode } from "react"
import { Code } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 p-4">
      <div className="flex items-center mb-8">
        <Code className="h-8 w-8 mr-2" />
        <h1 className="text-2xl font-bold">الهاكاثون</h1>
      </div>
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </div>
  )
}
