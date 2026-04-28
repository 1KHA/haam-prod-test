"use client"

import type React from "react"
import { dismissAppToast, showAppToast, type AppToastInput } from "@/lib/app-toast"

export type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export type ToastActionElement = React.ReactElement

export type ToasterToast = ToastProps

type ToastInput = Omit<ToasterToast, "id">

function toast(props: ToastInput) {
  const id = showAppToast(props)

  return {
    id,
    dismiss: () => dismissAppToast(id),
    update: (nextProps: Partial<ToastInput>) =>
      showAppToast({
        ...props,
        ...nextProps,
        id,
      } as AppToastInput & { id: string }),
  }
}

function useToast() {
  return {
    toasts: [] as ToasterToast[],
    toast,
    dismiss: (toastId?: string) => dismissAppToast(toastId),
  }
}

export { useToast, toast }
