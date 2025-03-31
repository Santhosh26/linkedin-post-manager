// src/hooks/use-toast.ts
"use client"

import { toast as sonnerToast, type ExternalToast } from "sonner"

type ToastVariants = "default" | "destructive"

interface ToastProps extends Omit<ExternalToast, "description"> {
  title?: string
  description?: string
  variant?: ToastVariants
}

export const useToast = () => {
  const toast = ({
    title,
    description,
    variant = "default",
    ...props
  }: ToastProps) => {
    // For destructive variants, add appropriate styling
    const variantClassNames = variant === "destructive" ? "destructive" : undefined

    // If we have a title and description
    if (title && description) {
      return sonnerToast(title, {
        description,
        className: variantClassNames,
        ...props,
      })
    }
    
    // If we only have a title
    if (title) {
      return sonnerToast(title, {
        className: variantClassNames,
        ...props,
      })
    }
    
    // If we only have a description
    if (description) {
      return sonnerToast(description, {
        className: variantClassNames,
        ...props,
      })
    }
    
    // Fallback for unexpected cases
    return sonnerToast("Notification", props)
  }

  return { toast }
}