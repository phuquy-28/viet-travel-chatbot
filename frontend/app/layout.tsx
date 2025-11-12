import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vietnam Travel Guide - AI Chatbot",
  description: "Khám phá du lịch Việt Nam cùng trợ lý ảo thông minh | Discover Vietnam with AI-powered travel assistant",
  keywords: ["Vietnam", "travel", "chatbot", "AI", "du lịch", "Việt Nam", "trợ lý ảo"],
  authors: [{ name: "Vietnam Travel Guide" }],
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head />
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
