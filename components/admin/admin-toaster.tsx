"use client"

import React, { useEffect, useState } from 'react'
import { X } from "lucide-react"

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  onClose: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  title, 
  description, 
  variant = "default", 
  onClose 
}) => {
  return (
    <div 
      className={`
        relative flex items-center justify-between p-4 mb-2 rounded-md shadow-md border
        ${variant === "destructive" ? "bg-red-50 border-red-200 text-red-800" : "bg-white border-gray-200"}
      `}
    >
      <div>
        {title && <h4 className="font-semibold">{title}</h4>}
        {description && <p className="text-sm">{description}</p>}
      </div>
      <button 
        onClick={() => onClose(id)} 
        className="p-1 rounded-full hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function AdminToaster() {
  const [toasts, setToasts] = useState<ToastProps[]>([])
  
  // Listen for toast events
  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      const toast = event.detail
      const id = Math.random().toString(36).substring(2, 9)
      
      setToasts(prev => [...prev, { ...toast, id, onClose: removeToast }])
      
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        removeToast(id)
      }, 3000)
    }
    
    // Add event listener
    window.addEventListener('admin-toast' as any, handleToast as EventListener)
    
    // Clean up
    return () => {
      window.removeEventListener('admin-toast' as any, handleToast as EventListener)
    }
  }, [])
  
  // Remove toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }
  
  if (toasts.length === 0) return null
  
  return (
    <div className="fixed top-4 right-4 z-50 w-72">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}

// Helper function to show toast
export function showAdminToast(toast: Omit<ToastProps, 'id' | 'onClose'>) {
  const event = new CustomEvent('admin-toast', { detail: toast })
  window.dispatchEvent(event)
}
