import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import Loading from "./loading"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "SketchChat - Real-time Chat & Drawing",
  description: "A colorful real-time chat application with collaborative drawing features",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
