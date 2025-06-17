"use client"

import { motion } from "framer-motion"
import { Card, type CardProps } from "@/components/ui/card"

interface AnimatedCardProps extends CardProps {
  delay?: number
  hover?: boolean
}

export function AnimatedCard({ children, delay = 0, hover = true, className = "", ...props }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.02, y: -5 } : undefined}
      className={className}
    >
      <Card {...props}>{children}</Card>
    </motion.div>
  )
}
