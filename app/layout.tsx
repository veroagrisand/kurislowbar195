import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: {
    default: "Kuri Coffee Slowbar 195 - Authentic Indonesian Coffee Experience",
    template: "%s | Kuri Coffee Slowbar 195",
  },
  description:
    "Reserve your perfect coffee experience at Kuri Coffee Slowbar 195. Discover premium Indonesian coffee, cozy atmosphere, and easy online booking.",
  keywords: ["coffee", "slowbar", "Padang", "Indonesia", "reservation", "cafe", "specialty coffee", "Kuri Coffee"],
  authors: [{ name: "v0.dev" }],
  creator: "v0.dev",
  publisher: "v0.dev",
  openGraph: {
    title: "Kuri Coffee Slowbar 195 - Authentic Indonesian Coffee Experience",
    description:
      "Reserve your perfect coffee experience at Kuri Coffee Slowbar 195. Discover premium Indonesian coffee, cozy atmosphere, and easy online booking.",
    url: "https://kurislowbar195.tech", // Replace with your actual domain
    siteName: "Kuri Coffee Slowbar 195",
    images: [
      {
        url: "/images/background.jpg", // Replace with a high-quality image for OG
        width: 1200,
        height: 630,
        alt: "Kuri Coffee Slowbar 195 Exterior",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kuri Coffee Slowbar 195 - Authentic Indonesian Coffee Experience",
    description:
      "Reserve your perfect coffee experience at Kuri Coffee Slowbar 195. Discover premium Indonesian coffee, cozy atmosphere, and easy online booking.",
    images: ["/images/background.jpg"], // Replace with a high-quality image for Twitter
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          <Navbar />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
