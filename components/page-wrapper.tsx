"use client"

import type React from "react"

import { motion } from "framer-motion"

interface PageWrapperProps extends React.ComponentProps<typeof motion.div> {
  children: React.ReactNode
}

export function PageWrapper({ children, className, ...props }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
