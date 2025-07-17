"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Coffee, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface CoffeeOption {
  id: string
  name: string
  price: number
  description?: string
}

interface CoffeeMenuSectionProps {
  coffeeOptions: CoffeeOption[]
  loadingCoffee: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function CoffeeMenuSection({ coffeeOptions, loadingCoffee }: CoffeeMenuSectionProps) {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Our Coffee Selection</h2>
          <p className="text-base sm:text-lg text-muted-foreground">Discover the finest Indonesian coffee beans</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {loadingCoffee ? (
            <p className="col-span-full text-center text-muted-foreground">Loading coffee options…</p>
          ) : (
            coffeeOptions.map((coffee, index) => (
              <motion.div key={coffee.id} variants={itemVariants}>
                <Card className="relative overflow-hidden h-full">
                  {coffee.name.includes("Arabica") && ( // Example: check for "Arabica" to mark as popular
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <Badge className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-coffee-600 text-white text-xs">
                        Popular
                      </Badge>
                    </motion.div>
                  )}
                  {coffee.name.includes("Luwak") && ( // Example: check for "Luwak" to mark as premium
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <Badge className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-purple-600 text-white text-xs">
                        Premium
                      </Badge>
                    </motion.div>
                  )}
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      className="bg-coffee-100 dark:bg-coffee-900 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center"
                    >
                      <Coffee className="h-6 w-6 sm:h-8 sm:w-8 text-coffee-600" />
                    </motion.div>
                    <CardTitle className="text-base sm:text-lg">{coffee.name}</CardTitle>
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                      className="text-xl sm:text-2xl font-bold text-coffee-600"
                    >
                      Rp {coffee.price.toLocaleString("id-ID")} {/* Format price */}
                    </motion.div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-center text-xs sm:text-sm">{coffee.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 sm:mt-12"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/reservation" className="block">
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 button-press px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              >
                Reserve & Order Now
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
