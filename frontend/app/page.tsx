"use client"
import { useState } from "react"
import Sidebar from "@/components/sidebar"
import ChatArea from "@/components/chat-area"

export default function Home() {
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>()

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId)
  }

  const handleNewChat = () => {
    setActiveConversationId(undefined)
  }

  const handleConversationChange = (conversationId: string) => {
    setActiveConversationId(conversationId)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        onConversationSelect={handleConversationSelect}
        onNewChat={handleNewChat}
        activeConversationId={activeConversationId}
      />
      <ChatArea 
        conversationId={activeConversationId}
        onConversationChange={handleConversationChange}
      />
    </div>
  )
}
