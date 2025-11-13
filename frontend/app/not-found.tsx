"use client"

import Link from "next/link"
import { Home, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function NotFound() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          {language === "vi" ? "Trang không tìm thấy" : "Page Not Found"}
        </h2>
        <p className="text-muted-foreground mb-8">
          {language === "vi"
            ? "Xin lỗi, trang bạn đang tìm kiếm không tồn tại."
            : "Sorry, the page you are looking for does not exist."}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            <Home size={18} />
            <span>{language === "vi" ? "Về trang chủ" : "Go Home"}</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border border-border bg-background text-foreground px-6 py-3 rounded-lg font-medium hover:bg-muted transition"
          >
            <ArrowLeft size={18} />
            <span>{language === "vi" ? "Quay lại" : "Go Back"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

