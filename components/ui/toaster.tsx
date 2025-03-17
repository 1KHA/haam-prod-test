"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  // Auto-dismiss toasts after 3 seconds (changed from 5 seconds)
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dismiss(toast.id)
      }, 3000) // Changed from 5000 to 3000 ms
      
      timers.push(timer)
    })
    
    // Clean up timers on unmount or when toasts change
    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [toasts, dismiss])

  return (
    <div className="fixed top-0 z-[100] flex flex-col items-end gap-2 p-4 max-h-screen w-full overflow-hidden">
      {toasts.map(function ({ id, title, description, variant, ...props }) {
        return (
          <Toast key={id} id={id} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        )
      })}
    </div>
  )
}
