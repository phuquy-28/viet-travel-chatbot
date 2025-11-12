/**
 * API Client for Vietnam Travel Chatbot Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  language: "vi" | "en";
}

export interface ChatResponse {
  message: string;
  conversation_id: string;
  follow_up_questions: string[];
  sources: Array<{
    content: string;
    metadata: Record<string, unknown>;
  }>;
  links: Array<{
    title: string;
    url: string;
    type: string;
  }>;
}

export interface ConversationSummary {
  conversation_id: string;
  title: string;
  last_message: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationDetail {
  conversation_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  language: string;
}

export interface Destination {
  id: string;
  name: string;
  name_en: string;
  region: "north" | "central" | "south";
  type: string[];
  description: string;
  description_en: string;
  image_url: string;
  highlights: string[];
  highlights_en: string[];
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Chat endpoints
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/chat/", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Conversation endpoints
  async getConversations(): Promise<ConversationSummary[]> {
    return this.request<ConversationSummary[]>("/api/conversations/");
  }

  async getConversation(conversationId: string): Promise<ConversationDetail> {
    return this.request<ConversationDetail>(`/api/conversations/${conversationId}`);
  }

  async createConversation(): Promise<{ conversation_id: string }> {
    return this.request<{ conversation_id: string }>("/api/conversations/new", {
      method: "POST",
    });
  }

  async deleteConversation(conversationId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/conversations/${conversationId}`, {
      method: "DELETE",
    });
  }

  // TTS endpoint
  async textToSpeech(text: string, language: "vi" | "en"): Promise<Blob> {
    const url = `${this.baseUrl}/api/tts/`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, language }),
    });

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.status}`);
    }

    return response.blob();
  }

  // Destination endpoints
  async getDestinations(params?: {
    region?: string;
    type?: string;
    language?: string;
  }): Promise<Destination[]> {
    const searchParams = new URLSearchParams();
    if (params?.region) searchParams.append("region", params.region);
    if (params?.type) searchParams.append("type", params.type);
    if (params?.language) searchParams.append("language", params.language);

    const query = searchParams.toString();
    const endpoint = `/api/destinations/${query ? `?${query}` : ""}`;

    return this.request<Destination[]>(endpoint);
  }

  async getDestination(
    destinationId: string,
    language: string = "vi"
  ): Promise<Destination> {
    return this.request<Destination>(
      `/api/destinations/${destinationId}?language=${language}`
    );
  }

  // Health check
  async healthCheck(): Promise<{ status: string; debug: boolean }> {
    return this.request<{ status: string; debug: boolean }>("/health");
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

export default apiClient;

