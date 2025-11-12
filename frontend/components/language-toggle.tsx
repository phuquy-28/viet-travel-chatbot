"use client"

import { useLanguage } from "@/contexts/language-context"

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex gap-1 bg-sidebar-accent rounded-full p-1">
      <button
        onClick={() => setLanguage("vi")}
        className={`px-2 py-1 rounded-full text-xs font-medium transition ${
          language === "vi"
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-border"
        }`}
      >
        Việt
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 rounded-full text-xs font-medium transition ${
          language === "en"
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-border"
        }`}
      >
        EN
      </button>
    </div>
  )
}
