"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Coffee,
  MapPin,
  Clock,
  Phone,
  Star,
  Users,
  Wifi,
  Car,
  Calendar,
  ArrowRight,
  Instagram,
  Facebook,
  Search,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageWrapper } from "@/components/page-wrapper"
import { AnimatedCard } from "@/components/animated-card"
import { GallerySection } from "@/components/gallery-section"

const features = [
  {
    icon: Coffee,
    title: "Premium Coffee",
    description: "Carefully selected beans from Indonesia's finest regions",
  },
  {
    icon: Users,
    title: "Cozy Atmosphere",
    description: "Perfect for meetings, dates, or quiet work sessions",
  },
  {
    icon: Wifi,
    title: "Free WiFi",
    description: "High-speed internet for digital nomads and students",
  },
  {
    icon: Car,
    title: "Easy Parking",
    description: "Convenient parking available for all customers",
  },
]

const coffeeMenu = [
  {
    name: "Arabica House Blend",
    price: "Rp 45,000",
    description: "Our signature blend with notes of chocolate and caramel",
    popular: true,
  },
  {
    name: "Kopi Luwak Premium",
    price: "Rp 85,000",
    description: "Rare and exotic coffee with unique processing method",
    premium: true,
  },
  {
    name: "Java Preanger",
    price: "Rp 55,000",
    description: "Traditional Indonesian coffee with earthy undertones",
  },
  {
    name: "Toraja Highland",
    price: "Rp 65,000",
    description: "Full-bodied coffee from the mountains of Sulawesi",
  },
]

const reviews = [
  {
    name: "Sarah M.",
    rating: 5,
    comment: "Amazing coffee and such a peaceful atmosphere. Perfect for working!",
    date: "2 weeks ago",
  },
  {
    name: "Ahmad R.",
    rating: 5,
    comment: "Best coffee in town! The staff is friendly and the place is always clean.",
    date: "1 month ago",
  },
  {
    name: "Lisa K.",
    rating: 4,
    comment: "Great coffee selection. The Kopi Luwak is definitely worth trying.",
    date: "3 weeks ago",
  },
]

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

export default function LandingPage() {
  const router = useRouter()

  return (
    <PageWrapper className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 hero-overlay z-10" />
        <Image
          src="/images/background.jpg"
          alt="Kuri Coffee Slow Bar 195 - Barista at Work"
          fill
          className="object-cover"
          priority
        />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-20 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 text-balance leading-tight">
              Kuri
              <span className="block text-coffee-400">Slow Bar 195</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 text-balance max-w-3xl mx-auto">
              Where every cup tells a story of Indonesian coffee heritage
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg button-press w-full sm:w-auto"
                onClick={() => router.push("/reservation")}
              >
                <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Reserve Your Table
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg button-press w-full sm:w-auto"
                onClick={() => router.push("/dashboard")}
              >
                <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Find My Reservations
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-balance">
                About Kuri Coffee Slow Bar 195
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
                Located in the heart of the city, Kuri Coffee Slow Bar 195 is more than just a coffee shop. We're a
                destination for coffee enthusiasts who appreciate the art of slow brewing and the rich heritage of
                Indonesian coffee culture.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                Our carefully curated selection of premium beans, combined with expert brewing techniques, creates an
                unforgettable coffee experience in a warm and welcoming atmosphere.
              </p>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4 sm:gap-6"
              >
                <motion.div variants={itemVariants} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-coffee-600">5+</div>
                  <div className="text-sm sm:text-base text-muted-foreground">Years Serving</div>
                </motion.div>
                <motion.div variants={itemVariants} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-coffee-600">1000+</div>
                  <div className="text-sm sm:text-base text-muted-foreground">Happy Customers</div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative order-1 lg:order-2"
            >
              <Card className="coffee-gradient p-6 sm:p-8 card-hover">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-2 gap-4 sm:gap-6"
                >
                  {features.map((feature, index) => (
                    <motion.div key={index} variants={itemVariants} className="text-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="bg-background rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-sm"
                      >
                        <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-coffee-600" />
                      </motion.div>
                      <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Visit Us</h2>
            <p className="text-lg text-muted-foreground">Find us in the heart of the city</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: MapPin,
                title: "Location",
                content: (
                  <>
                    <p className="text-muted-foreground mb-4">
                      Jl. S. Parman No.195
                      <br />
                      Ulak Karang Utara, Kec. Padang Utara, Kota Padang, Sumatera Barat 25173
                      <br />
                      Indonesia
                    </p>
                    <Link href="https://maps.app.goo.gl/2RkhjpzRBMwg1Yku8">
                    <Button variant="outline" size="sm" className="button-press">
                      <MapPin className="mr-2 h-4 w-4" />
                      View on Maps
                    </Button>
                    </Link>
                  </>
                ),
              },
              {
                icon: Clock,
                title: "Opening Hours",
                content: (
                  <>
                    <div className="space-y-2 text-muted-foreground mb-4">
                      <div className="flex justify-between">
                        <span>Monday - Sunday</span>
                        <span className="font-mono">09:00 - 21:00</span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Open Now
                    </Badge>
                  </>
                ),
              },
              {
                icon: Phone,
                title: "Contact",
                content: (
                  <>
                    <div className="space-y-3 text-muted-foreground mb-4">
                      <div className="flex items-center justify-center">
                        <Phone className="inline h-4 w-4 mr-2" />
                        <span className="font-mono">+62 822 4604 8185</span>
                      </div>
                      <div className="flex items-center justify-center">
                        
                      </div>
                    </div>
                    <div className="flex justify-center gap-3">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Link href="https://www.instagram.com/kuri_slowbar195/">
                        <Button size="sm" variant="outline" className="button-press">
                          <Instagram className="h-4 w-4" />
                        </Button>
                      </Link>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Link href="">
                        <Button size="sm" variant="outline" className="button-press">
                          <Facebook className="h-4 w-4" />
                        </Button>
                      </Link>
                      </motion.div>
                    </div>
                  </>
                ),
              },
            ].map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AnimatedCard delay={index * 0.1} className="text-center card-hover">
                  <CardHeader>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="bg-coffee-100 dark:bg-coffee-900 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center"
                    >
                      <item.icon className="h-6 w-6 text-coffee-600" />
                    </motion.div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>{item.content}</CardContent>
                </AnimatedCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Coffee Menu Preview */}
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
            {coffeeMenu.map((coffee, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AnimatedCard delay={index * 0.1} className="relative overflow-hidden h-full">
                  {coffee.popular && (
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
                  {coffee.premium && (
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
                      {coffee.price}
                    </motion.div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-center text-xs sm:text-sm">{coffee.description}</p>
                  </CardContent>
                </AnimatedCard>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-8 sm:mt-12"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 button-press px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
                onClick={() => router.push("/reservation")}
              >
                Reserve & Order Now
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <GallerySection />

      {/* Reviews Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring" }}
                className="flex"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.div
                    key={star}
                    initial={{ opacity: 0, rotate: -180 }}
                    whileInView={{ opacity: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + star * 0.1 }}
                  >
                    <Star className="h-6 w-6 fill-coffee-400 text-coffee-400" />
                  </motion.div>
                ))}
              </motion.div>
              <span className="text-lg font-semibold">4.8/5</span>
              <span className="text-muted-foreground">(127 reviews)</span>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {reviews.map((review, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AnimatedCard delay={index * 0.1}>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="bg-coffee-100 dark:bg-coffee-900 rounded-full p-2 w-10 h-10 flex items-center justify-center mr-3"
                      >
                        <span className="font-semibold text-coffee-600">{review.name.charAt(0)}</span>
                      </motion.div>
                      <div>
                        <div className="font-semibold">{review.name}</div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating ? "fill-coffee-400 text-coffee-400" : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">"{review.comment}"</p>
                    <p className="text-sm text-muted-foreground">{review.date}</p>
                  </CardContent>
                </AnimatedCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6 text-balance">Ready for Your Perfect Coffee Experience?</h2>
            <p className="text-xl mb-8 text-background/80 text-balance">
              Reserve your table now and enjoy our premium Indonesian coffee in a cozy atmosphere
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90 px-8 py-4 text-lg button-press"
                  onClick={() => router.push("/reservation")}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Make Reservation
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 bg-white rounded-md p-1 shadow-sm">
                  <Image
                    src="/images/logo.jpg"
                    alt="Kuri Coffee Slowbar 195 Logo"
                    fill
                    className="object-contain rounded-sm"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Kuri Coffee</h3>
                  <p className="text-sm text-muted-foreground">Slow Bar 195</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4 text-balance">
                Where every cup tells a story of Indonesian coffee heritage.
              </p>
              <div className="flex gap-3">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link href="https://www.instagram.com/kuri_slowbar195/">
                  <Button size="sm" variant="outline" className="button-press">
                    <Instagram className="h-4 w-4" />
                  </Button>
                </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button size="sm" variant="outline" className="button-press">
                    <Facebook className="h-4 w-4"  />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="/reservation" className="hover:text-foreground transition-colors">
                    Make Reservation
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="hover:text-foreground transition-colors">
                    Find My Reservations
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Jl. S. Parman No.195, Ulak Karang Utara, Kec. Padang Utara, Kota Padang, Sumatera Barat 25173
                </li>
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="font-mono">+62 822 4604 8185</span>
                </li>
                <li className="flex items-center">
                  
                </li>
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h4 className="font-semibold mb-4">Opening Hours</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex justify-between">
                  <span>Mon - Sun:</span>
                  <span className="font-mono">09:00 - 21:00</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="border-t border-border mt-8 pt-8 text-center text-muted-foreground"
          >
            <p>&copy; 2025 Kuri Coffee Slow Bar 195. All rights reserved.</p>
            <p>PerrrSPACE.id</p>
          </motion.div>
        </div>
      </footer>
    </PageWrapper>
  )
}
