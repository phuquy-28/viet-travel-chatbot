"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "vi" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  vi: {
    newChat: "Cuộc trò chuyện mới",
    conversations: "Lịch sử trò chuyện",
    language: "Ngôn ngữ",
    settings: "Cài đặt",
    exploreDestinations: "Khám phá điểm đến",
    alwaysHere: "Luôn sẵn sàng giúp bạn",
    askAboutVietnam: "Hỏi về du lịch Việt Nam...",
    disclaimer: "Hỗ trợ du lịch Việt Nam bằng AI - Khám phá đất nước xinh đẹp cùng tôi",
    welcomeTitle: "Chào mừng đến với du lịch Việt Nam",
    welcomeSubtitle:
      "Tôi sẽ giúp bạn tìm hiểu về những điểm du lịch đẹp nhất, ẩm thực, văn hóa và trải nghiệm tuyệt vời tại Việt Nam!",
    deleteConversation: "Xóa cuộc trò chuyện",
    confirmDelete: "Bạn có chắc chắn muốn xóa cuộc trò chuyện này?",
    cancel: "Hủy",
    delete: "Xóa",
    conversationDeleted: "Đã xóa cuộc trò chuyện",
  },
  en: {
    newChat: "New Chat",
    conversations: "Conversations",
    language: "Language",
    settings: "Settings",
    exploreDestinations: "Explore Destinations",
    alwaysHere: "Always here to help",
    askAboutVietnam: "Ask about Vietnam travel...",
    disclaimer: "Vietnam Travel AI Guide - Discover the beauty of Vietnam with me",
    welcomeTitle: "Welcome to Vietnam Travel Guide",
    welcomeSubtitle:
      "I'll help you discover the most beautiful attractions, cuisine, culture and amazing experiences across Vietnam!",
    deleteConversation: "Delete conversation",
    confirmDelete: "Are you sure you want to delete this conversation?",
    cancel: "Cancel",
    delete: "Delete",
    conversationDeleted: "Conversation deleted",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("vi")

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[Language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
