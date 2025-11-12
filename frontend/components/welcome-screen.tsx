"use client"

import { useLanguage } from "@/contexts/language-context"

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void
}

export default function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  const { t } = useLanguage()

  const suggestions = [
    { emoji: "🏯", text: "Hội An có gì đẹp?", en: "What to visit in Hoi An?" },
    { emoji: "🗻", text: "Trekking Sa Pa", en: "Trekking in Sa Pa" },
    { emoji: "🌊", text: "Du lịch Phú Quốc", en: "Phu Quoc Tourism" },
    { emoji: "🍜", text: "Ăn gì ở Hà Nội?", en: "What to eat in Hanoi?" },
  ]

  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <div className="mb-8 animate-float">
        <div className="w-16 h-16 mx-auto mb-4 text-4xl opacity-80">🇻🇳</div>
      </div>

      <h2 className="text-4xl font-bold text-foreground mb-3 text-balance">{t("welcomeTitle")}</h2>
      <p className="text-lg text-muted-foreground mb-12 max-w-lg text-balance">{t("welcomeSubtitle")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((sug, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(sug.text)}
            className="text-left p-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-muted transition group"
          >
            <div className="text-2xl mb-2">{sug.emoji}</div>
            <p className="font-medium text-foreground text-sm">{sug.text}</p>
            <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">{sug.en}</p>
          </button>
        ))}
      </div>

      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <pattern id="vietnamPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 20 10 L 10 20 L 0 10 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#vietnamPattern)" />
        </svg>
      </div>
    </div>
  )
}
