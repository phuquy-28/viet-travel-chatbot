"use client"

import { useState } from "react"
import { Volume2, VolumeX, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import ReactMarkdown from "react-markdown"

interface ChatMessageProps {
  message: {
    role: "user" | "assistant"
    content: string
  }
  language: "vi" | "en"
}

export default function ChatMessage({ message, language }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const handleTTS = async () => {
    if (isPlaying && audio) {
      // Stop playing
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
      return
    }

    setIsLoadingAudio(true)
    try {
      const audioBlob = await apiClient.textToSpeech(message.content, language)
      const audioUrl = URL.createObjectURL(audioBlob)
      const newAudio = new Audio(audioUrl)
      
      newAudio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      newAudio.onerror = () => {
        setIsPlaying(false)
        setIsLoadingAudio(false)
        URL.revokeObjectURL(audioUrl)
      }

      await newAudio.play()
      setAudio(newAudio)
      setIsPlaying(true)
    } catch (error) {
      console.error("Error playing TTS:", error)
    } finally {
      setIsLoadingAudio(false)
    }
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex items-start gap-2 max-w-xl">
        {/* TTS Button for assistant messages */}
        {!isUser && (
          <button
            onClick={handleTTS}
            disabled={isLoadingAudio}
            className="mt-3 p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition disabled:opacity-50"
            title={isPlaying ? "Stop" : "Listen"}
          >
            {isLoadingAudio ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isPlaying ? (
              <VolumeX size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </button>
        )}

        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-muted text-foreground rounded-bl-none border border-border"
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  // Custom link styling
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary/80"
                    />
                  ),
                  // Custom paragraph styling
                  p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
                  // Custom list styling
                  ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-4 mb-2" />,
                  ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-4 mb-2" />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
