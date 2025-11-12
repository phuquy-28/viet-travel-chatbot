"use client"

import { useState, useEffect } from "react"
import { Plus, MessageSquare, Compass, Settings, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import LanguageToggle from "./language-toggle"
import { apiClient, type ConversationSummary } from "@/lib/api-client"
import Link from "next/link"

interface SidebarProps {
  onConversationSelect?: (conversationId: string) => void
  onNewChat?: () => void
  activeConversationId?: string
}

export default function Sidebar({ onConversationSelect, onNewChat, activeConversationId }: SidebarProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setIsLoading(true)
    try {
      const data = await apiClient.getConversations()
      setConversations(data)
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    onNewChat?.()
  }

  const handleConversationClick = (conversationId: string) => {
    onConversationSelect?.(conversationId)
  }

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2.5 font-medium hover:opacity-90 transition"
        >
          <Plus size={18} />
          {t("newChat")}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-sidebar-foreground/60 px-2 py-2">{t("conversations")}</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sidebar-foreground/60">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-sidebar-foreground/60 px-2 py-4 text-center">
              {t("language") === "vi" ? "Chưa có cuộc trò chuyện" : "No conversations yet"}
            </p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.conversation_id}
                onClick={() => handleConversationClick(conv.conversation_id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition truncate ${
                  activeConversationId === conv.conversation_id ? "bg-sidebar-accent" : ""
                }`}
              >
                <MessageSquare size={14} className="inline mr-2" />
                {conv.title}
              </button>
            ))
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <Link 
          href="/destinations"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition"
        >
          <Compass size={18} />
          <span>{t("exploreDestinations")}</span>
        </Link>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium text-sidebar-foreground">{t("language")}</span>
          <LanguageToggle />
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition">
          <Settings size={18} />
          <span>{t("settings")}</span>
        </button>
      </div>
    </div>
  )
}
