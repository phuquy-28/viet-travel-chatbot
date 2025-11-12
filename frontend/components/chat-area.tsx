"use client"

import { useState, useEffect } from "react"
import { Send, Mic, Paperclip, Loader2, Menu } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import ChatMessage from "./chat-message"
import WelcomeScreen from "./welcome-screen"
import Logo from "./logo"
import { apiClient, type ChatMessage as ChatMessageType } from "@/lib/api-client"

interface Message extends ChatMessageType {
  followUpQuestions?: string[]
  links?: Array<{ title: string; url: string; type: string }>
}

interface ChatAreaProps {
  conversationId?: string
  onConversationChange?: (id: string) => void
  initialMessage?: string
  onToggleSidebar?: () => void
}

export default function ChatArea({ conversationId, onConversationChange, initialMessage, onToggleSidebar }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { t, language } = useLanguage()
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId)
  const [hasAutoSent, setHasAutoSent] = useState(false)

  // Load conversation when conversationId changes
  useEffect(() => {
    if (conversationId && conversationId !== currentConversationId) {
      loadConversation(conversationId)
      setHasAutoSent(false) // Reset auto-send flag when loading conversation
    } else if (!conversationId && currentConversationId) {
      // Reset to new chat when conversationId becomes undefined
      setMessages([])
      setCurrentConversationId(undefined)
      setHasAutoSent(false) // Reset auto-send flag
    }
  }, [conversationId])

  // Auto-send initial message
  useEffect(() => {
    if (initialMessage && !hasAutoSent && !isLoading && messages.length === 0) {
      setHasAutoSent(true)
      handleSend(initialMessage)
    }
  }, [initialMessage, hasAutoSent, isLoading, messages.length])

  const loadConversation = async (id: string) => {
    try {
      const conversation = await apiClient.getConversation(id)
      setMessages(conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })))
      setCurrentConversationId(id)
    } catch (error) {
      console.error("Error loading conversation:", error)
    }
  }

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim() || isLoading) return

    // Add user message to UI
    const userMessage: Message = { role: "user", content: textToSend }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Send to backend API
      const response = await apiClient.sendMessage({
        message: textToSend,
        conversation_id: currentConversationId,
        language: language
      })

      // Update conversation ID if new
      if (!currentConversationId) {
        setCurrentConversationId(response.conversation_id)
        onConversationChange?.(response.conversation_id)
      }

      // Add assistant message with follow-up questions
      const assistantMessage: Message = {
        role: "assistant",
        content: response.message,
        followUpQuestions: response.follow_up_questions,
        links: response.links
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      
      // Show error message
      const errorMessage: Message = {
        role: "assistant",
        content: language === "vi" 
          ? "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau."
          : "Sorry, an error occurred. Please try again later."
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowUpClick = (question: string) => {
    handleSend(question)
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Toggle Sidebar Button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-muted rounded-lg transition lg:hidden"
            title={language === "vi" ? "Mở/Đóng menu" : "Toggle menu"}
          >
            <Menu size={20} />
          </button>
          
          {/* Logo */}
          <Logo size="sm" showText={false} />
          
          <div>
            <h1 className="font-semibold text-foreground">Vietnam Travel Guide</h1>
            <p className="text-xs text-muted-foreground">{t("alwaysHere")}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <WelcomeScreen onSendMessage={handleSend} />
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <div key={i} className="space-y-3">
                <ChatMessage message={msg} language={language} />
                
                {/* Follow-up questions */}
                {msg.role === "assistant" && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-4">
                    {msg.followUpQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFollowUpClick(question)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground border border-border transition disabled:opacity-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xl px-4 py-3 rounded-2xl bg-muted border border-border rounded-bl-none">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{language === "vi" ? "Đang suy nghĩ..." : "Thinking..."}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-3 border border-border focus-within:border-primary transition">
            <button className="text-muted-foreground hover:text-foreground transition">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder={t("askAboutVietnam")}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            <button className="text-muted-foreground hover:text-foreground transition">
              <Mic size={20} />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-primary text-primary-foreground rounded-full p-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">{t("disclaimer")}</p>
        </div>
      </div>
    </div>
  )
}
