"use client"

import * as React from "react"

import type { ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastsMap = Map<
  string,
  {
    toast: ToastProps
    timeout: ReturnType<typeof setTimeout> | null
  }
>

type Action =
  | {
      type: "ADD_TOAST"
      toast: ToastProps
    }
  | {
      type: "UPDATE_TOAST"
      toast: ToastProps
    }
  | {
      type: "DISMISS_TOAST"
      toastId?: ToastProps["id"]
    }
  | {
      type: "REMOVE_TOAST"
      toastId?: ToastProps["id"]
    }

interface State {
  toasts: ToastProps[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects !
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id!)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: ((state: State) => void)[] = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type Toast = Pick<ToastProps, "id" | "duration" | "promise"> &
  (
    | {
        variant?: "default" | "destructive" | "success"
        title?: string
        description?: string
        action?: React.ReactNode
      }
    | {
        variant: "promise"
        title: string
        loading: string
        success: string
        error: string
      }
  )

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  const addToast = React.useCallback((toast: ToastProps) => {
    dispatch({ type: "ADD_TOAST", toast })
  }, [])

  const updateToast = React.useCallback((toast: ToastProps) => {
    dispatch({ type: "UPDATE_TOAST", toast })
  }, [])

  const dismissToast = React.useCallback((toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId })
  }, [])

  const removeToast = React.useCallback((toastId?: string) => {
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, [])

  return {
    ...state,
    toast: React.useCallback(
      ({ ...props }: Toast) => {
        const id = props.id || crypto.randomUUID()

        const update = (props: ToastProps) => updateToast({ ...props, id, open: true })
        const dismiss = () => dismissToast(id)

        if (props.variant === "promise") {
          props.promise
            .then(() => {
              update({
                id,
                title: props.title,
                description: props.success,
                variant: "success",
              })
            })
            .catch((error: Error) => {
              update({
                id,
                title: props.title,
                description: props.error || error.message,
                variant: "destructive",
              })
            })
          addToast({
            id,
            title: props.title,
            description: props.loading,
            variant: "default",
            duration: 1000000,
          })
        } else {
          addToast({
            id,
            ...props,
            open: true,
            onOpenChange: (open) => {
              if (!open) dismiss()
            },
          })
        }

        return {
          id: id,
          dismiss: dismiss,
          update: update,
        }
      },
      [addToast, dismissToast, updateToast],
    ),
  }
}

export { useToast }
