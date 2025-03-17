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

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dismiss(toast.id)
      }, 5000)

      return () => clearTimeout(timer)
    })
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
