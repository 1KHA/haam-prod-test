"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 h-12 bg-primary text-primary-foreground flex items-center justify-between px-4 z-50">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">Hackathon Accelerator</h1>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm">
              Welcome, {user.name} | {user.role}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary"
            >
              Sign Out
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/auth/signin")}
            className="text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary"
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  )
}
