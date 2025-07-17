"use client" // Error boundaries must be Client Components

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/page-wrapper"
import { TriangleAlert } from "lucide-react"
import { motion } from "framer-motion"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <PageWrapper className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <TriangleAlert className="h-24 w-24 text-destructive mx-auto mb-6" />
        </motion.div>
        <h1 className="text-5xl font-bold text-foreground mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-8">
          We apologize for the inconvenience. An unexpected error occurred. Please try again.
        </p>
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="button-press"
          size="lg"
        >
          Try again
        </Button>
      </motion.div>
    </PageWrapper>
  )
}
