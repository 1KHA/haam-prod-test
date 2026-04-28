"use client"

import type React from "react"
import { toast as hotToast, type ToastOptions } from "react-hot-toast"

export type AppToastInput = {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number
}

const BASE_TOAST_OPTIONS: ToastOptions = {
  duration: 3000,
  position: "top-right",
  style: {
    maxWidth: "360px",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    lineHeight: "1.4",
  },
}

function renderToastContent({ title, description, action }: AppToastInput) {
  if (!title && !description && !action) {
    return null
  }

  return (
    <div className="flex flex-col gap-1 text-right">
      {title ? <div className="font-medium">{title}</div> : null}
      {description ? <div className="text-sm opacity-90">{description}</div> : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}

function getToastOptions(id?: string, duration?: number): ToastOptions {
  return {
    ...BASE_TOAST_OPTIONS,
    id,
    duration: duration ?? BASE_TOAST_OPTIONS.duration,
  }
}

function shouldUseSuccessStyle(title?: React.ReactNode) {
  return typeof title === "string" && /^(تم|تمت)/.test(title.trim())
}

export function showAppToast({ duration, id, variant = "default", ...content }: AppToastInput & { id?: string }) {
  const toastContent = renderToastContent(content)
  const options = getToastOptions(id, duration)

  if (variant === "destructive") {
    return hotToast.error(toastContent || "", options)
  }

  if (shouldUseSuccessStyle(content.title)) {
    return hotToast.success(toastContent || "", options)
  }

  return hotToast(toastContent || "", options)
}

export function dismissAppToast(toastId?: string) {
  hotToast.dismiss(toastId)
}
