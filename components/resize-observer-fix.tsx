"use client"

import { useEffect } from "react"

/**
 * Removes Chrome’s noisy “ResizeObserver loop …” messages
 * without touching real runtime errors.
 */
export function ResizeObserverFix() {
  useEffect(() => {
    const ignoreMsg = (msg?: unknown) => typeof msg === "string" && msg.toLowerCase().includes("resizeobserver loop")

    // Store original console methods
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    const originalConsoleLog = console.log

    // Patch console methods to filter out ResizeObserver warnings
    console.error = (...args) => {
      if (ignoreMsg(args[0])) return
      originalConsoleError(...args)
    }
    console.warn = (...args) => {
      if (ignoreMsg(args[0])) return
      originalConsoleWarn(...args)
    }
    console.log = (...args) => {
      if (ignoreMsg(args[0])) return
      originalConsoleLog(...args)
    }

    return () => {
      // Restore original console methods on unmount
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      console.log = originalConsoleLog
    }
  }, [])

  return null
}
