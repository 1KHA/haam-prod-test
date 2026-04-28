"use client"

import { showAppToast } from "@/lib/app-toast"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function AdminToaster() {
  return null
}

export function showAdminToast(toast: ToastProps) {
  showAppToast(toast)
}
