"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, MessageSquare, Compass, Settings, Loader2, Trash2, MoreVertical } from "lucide-react"
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
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    loadConversations()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Close menu if clicking outside the dropdown menu
      if (!target.closest('.conversation-menu')) {
        setOpenMenuId(null)
      }
    }

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openMenuId])

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

  const handleMenuToggle = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent conversation selection
    setOpenMenuId(openMenuId === conversationId ? null : conversationId)
  }

  const handleDeleteClick = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent conversation selection
    setOpenMenuId(null) // Close menu
    setConfirmDeleteId(conversationId)
  }

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return
    
    setDeletingId(confirmDeleteId)
    try {
      await apiClient.deleteConversation(confirmDeleteId)
      
      // If deleted conversation was active, trigger new chat
      if (confirmDeleteId === activeConversationId) {
        onNewChat?.()
      }
      
      // Refresh conversation list
      await loadConversations()
      
      // Show success message (optional - could add toast notification)
      console.log(t("conversationDeleted"))
    } catch (error) {
      console.error("Error deleting conversation:", error)
      alert(error instanceof Error ? error.message : "Failed to delete conversation")
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  const handleCancelDelete = () => {
    setConfirmDeleteId(null)
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
              <div key={conv.conversation_id} className="relative group">
                <button
                  onClick={() => handleConversationClick(conv.conversation_id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition truncate pr-10 ${
                    activeConversationId === conv.conversation_id ? "bg-sidebar-accent" : ""
                  }`}
                >
                  <MessageSquare size={14} className="inline mr-2" />
                  {conv.title}
                </button>
                
                {/* Menu button - shows on hover or when menu is open */}
                <div className="conversation-menu">
                  <button
                    onClick={(e) => handleMenuToggle(conv.conversation_id, e)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-opacity ${
                      openMenuId === conv.conversation_id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    title="Menu"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {/* Dropdown menu */}
                  {openMenuId === conv.conversation_id && (
                    <div className="absolute right-2 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-20 py-1 min-w-[150px]">
                      <button
                        onClick={(e) => handleDeleteClick(conv.conversation_id, e)}
                        disabled={deletingId === conv.conversation_id}
                        className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition flex items-center gap-2 disabled:opacity-50"
                      >
                        {deletingId === conv.conversation_id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>{t("delete")}</span>
                          </>
                        ) : (
                          <>
                            <Trash2 size={14} />
                            <span>{t("delete")}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
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

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCancelDelete}>
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("deleteConversation")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("confirmDelete")}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={!!deletingId}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {deletingId ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t("delete")}
                  </>
                ) : (
                  t("delete")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
