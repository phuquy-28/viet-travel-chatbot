"use client"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import Sidebar from "@/components/sidebar"
import ChatArea from "@/components/chat-area"
import DestinationsModal from "@/components/destinations-modal"

export default function Home() {
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>()
  const [initialMessage, setInitialMessage] = useState<string | undefined>()
  const [isDestinationsModalOpen, setIsDestinationsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { language } = useLanguage()

  // Check for destination query param
  useEffect(() => {
    const destination = searchParams.get('destination')
    if (destination) {
      // Create a message asking about the destination
      const message = language === 'vi' 
        ? `Giới thiệu cho tôi về ${destination}. Những điểm tham quan nổi bật, ẩm thực đặc sản, và kinh nghiệm du lịch ở đây là gì?`
        : `Tell me about ${destination}. What are the top attractions, local cuisine, and travel experiences there?`
      
      setInitialMessage(message)
      // Clear conversation to start fresh
      setActiveConversationId(undefined)
      
      // Remove destination param from URL to prevent re-triggering on language change/reload
      router.replace('/', { scroll: false })
    }
  }, [searchParams, language, router])

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId)
    setInitialMessage(undefined) // Clear initial message when selecting a conversation
  }

  const handleNewChat = () => {
    setActiveConversationId(undefined)
    setInitialMessage(undefined) // Clear initial message on new chat
  }

  const handleConversationChange = (conversationId: string) => {
    setActiveConversationId(conversationId)
  }

  const handleOpenDestinations = () => {
    setIsDestinationsModalOpen(true)
  }

  const handleCloseDestinations = () => {
    setIsDestinationsModalOpen(false)
  }

  const handleStartChatFromModal = (destinationName: string) => {
    // Create a message asking about the destination
    const message = language === 'vi' 
      ? `Giới thiệu cho tôi về ${destinationName}. Những điểm tham quan nổi bật, ẩm thực đặc sản, và kinh nghiệm du lịch ở đây là gì?`
      : `Tell me about ${destinationName}. What are the top attractions, local cuisine, and travel experiences there?`
    
    setInitialMessage(message)
    setActiveConversationId(undefined) // Start a new chat
  }

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        onConversationSelect={handleConversationSelect}
        onNewChat={handleNewChat}
        activeConversationId={activeConversationId}
        onOpenDestinations={handleOpenDestinations}
        isOpen={isSidebarOpen}
        onClose={handleToggleSidebar}
      />
      <ChatArea 
        conversationId={activeConversationId}
        onConversationChange={handleConversationChange}
        initialMessage={initialMessage}
        onToggleSidebar={handleToggleSidebar}
      />
      <DestinationsModal
        isOpen={isDestinationsModalOpen}
        onClose={handleCloseDestinations}
        onStartChat={handleStartChatFromModal}
      />
    </div>
  )
}
