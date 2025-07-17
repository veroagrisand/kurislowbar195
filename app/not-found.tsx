"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/page-wrapper"
import { Frown } from "lucide-react"
import { motion } from "framer-motion"

export default function NotFound() {
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
          <Frown className="h-24 w-24 text-primary mx-auto mb-6" />
        </motion.div>
        <h1 className="text-5xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/">
          <Button className="button-press" size="lg">
            Go to Home Page
          </Button>
        </Link>
      </motion.div>
    </PageWrapper>
  )
}
