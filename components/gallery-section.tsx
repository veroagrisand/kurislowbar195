"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const galleryImages = [
  {
    id: 1,
    src: "/images/background.jpg",
    alt: "Professional barista at work",
    title: "Expert Coffee Brewing",
    description: "Our skilled baristas craft each cup with precision and care using professional equipment",
  },
  {
    id: 2,
    src: "/images/gallery/barista-customers.jpg",
    alt: "Cozy coffee shop atmosphere",
    title: "Welcoming Atmosphere",
    description: "Enjoy intimate conversations and quality time in our comfortable setting",
  },
  {
    id: 3,
    src: "/images/gallery/latte-art.jpg",
    alt: "Beautiful latte art creation",
    title: "Artisan Latte Art",
    description: "Every cup is a masterpiece with beautiful latte art created by our talented baristas",
  },
  {
    id: 4,
    src: "/images/gallery/coffee-grinder.jpg",
    alt: "Fresh coffee bean grinding",
    title: "Fresh Ground Coffee",
    description: "We grind our premium beans fresh for each order using professional equipment",
  },
  {
    id: 5,
    src: "/images/gallery/coffee-pour.jpg",
    alt: "Coffee brewing process",
    title: "Perfect Pour",
    description: "Watch the magic happen as we pour the perfect cup with precision and care",
  },
  {
    id: 6,
    src: "/images/kuri-coffee-exterior.jpg",
    alt: "Coffee shop exterior",
    title: "Our Coffee Shop",
    description: "Visit us at our welcoming location in the heart of the city",
  },
]

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    setSelectedImage(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % galleryImages.length)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1)
    }
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Gallery</h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Take a visual journey through our coffee shop experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <Card className="overflow-hidden group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white font-semibold text-sm sm:text-lg">{image.title}</h3>
                    <p className="text-white/80 text-xs sm:text-sm">{image.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 sm:p-4"
              onClick={closeLightbox}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-4xl max-h-[90vh] w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={galleryImages[selectedImage].src || "/placeholder.svg"}
                    alt={galleryImages[selectedImage].alt}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-semibold text-lg sm:text-xl mb-1 sm:mb-2">
                    {galleryImages[selectedImage].title}
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base">{galleryImages[selectedImage].description}</p>
                </div>

                {/* Navigation buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
                  onClick={closeLightbox}
                >
                  <X className="h-4 w-4 sm:h-6 sm:w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
                </Button>

                {/* Image counter */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  {selectedImage + 1} / {galleryImages.length}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
