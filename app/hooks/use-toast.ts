import React from "react"
import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

const initialState: ToastState = {
  toasts: [],
}

let toastCount = 0

function generateId() {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER
  return toastCount.toString()
}

const listeners: Array<(state: ToastState) => void> = []
let memoryState: ToastState = initialState

function setState(fn: (state: ToastState) => ToastState) {
  memoryState = fn(memoryState)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function addToast(toast: Omit<Toast, "id">) {
  const id = generateId()
  const newToast: Toast = {
    ...toast,
    id,
    duration: toast.duration ?? 5000,
  }

  setState((state) => ({
    ...state,
    toasts: [...state.toasts, newToast],
  }))

  // Auto-dismiss toast after duration
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      dismissToast(id)
    }, newToast.duration)
  }

  return {
    id,
    dismiss: () => dismissToast(id),
    update: (props: Partial<Toast>) => updateToast(id, props),
  }
}

function dismissToast(toastId: string) {
  setState((state) => ({
    ...state,
    toasts: state.toasts.filter((t) => t.id !== toastId),
  }))
}

function updateToast(toastId: string, props: Partial<Toast>) {
  setState((state) => ({
    ...state,
    toasts: state.toasts.map((t) =>
      t.id === toastId ? { ...t, ...props } : t
    ),
  }))
}

function useToast() {
  const [state, setState] = useState<ToastState>(memoryState)

  const subscribe = useCallback((listener: (state: ToastState) => void) => {
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  React.useEffect(() => {
    const unsubscribe = subscribe(setState)
    return unsubscribe
  }, [subscribe])

  return {
    ...state,
    toast: addToast,
    dismiss: dismissToast,
  }
}

export { useToast, addToast as toast }