"use client"

import * as React from "react"
import { X } from "lucide-react"

// Simple utility function for class name merging
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

interface ToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
  className?: string
  children?: React.ReactNode
}

const Toast: React.FC<ToastProps> = ({ 
  variant = "default", 
  className, 
  children,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        variant === "default" ? "border bg-background text-foreground" : "",
        variant === "destructive" ? "destructive group border-destructive bg-destructive text-destructive-foreground" : "",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const ToastClose: React.FC<{
  className?: string
  onClick?: () => void
}> = ({ 
  className, 
  onClick 
}) => {
  return (
    <button
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-foreground/50 transition-opacity hover:text-foreground focus:outline-none focus:ring-2 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
        className
      )}
      onClick={onClick}
    >
      <X className="h-4 w-4" />
    </button>
  )
}

const ToastTitle: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ 
  className, 
  children 
}) => {
  return (
    <h2
      className={cn("text-sm font-semibold", className)}
    >
      {children}
    </h2>
  )
}

const ToastDescription: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ 
  className, 
  children 
}) => {
  return (
    <p
      className={cn("text-sm opacity-90", className)}
    >
      {children}
    </p>
  )
}

interface ToastActionProps {
  className?: string
  altText?: string
  children: React.ReactNode
  onClick?: () => void
}

const ToastAction: React.FC<ToastActionProps> = ({ 
  className, 
  children,
  onClick
}) => {
  return (
    <button
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export {
  Toast,
  ToastClose,
  ToastTitle,
  ToastDescription,
  ToastAction,
}
