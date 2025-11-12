# Vietnam Travel Chatbot - Frontend

Next.js frontend for the Vietnam travel advisory chatbot application.

## Technologies

- **Next.js 16**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Radix UI**: Component library
- **React Markdown**: Markdown rendering
- **Lucide React**: Icons

## Features

### 1. Chat Interface
- Modern chat interface with message bubbles
- Realtime typing indicators
- Follow-up question suggestions
- Markdown rendering for AI responses
- Text-to-Speech with audio controls

### 2. Conversation Management
- Save and load conversation history
- Sidebar with conversation list
- Switch between conversations
- Create new conversation

### 3. Multi-language Support
- Vietnamese / English toggle
- Dynamic translations
- Language-specific responses

### 4. Destination Discovery
- Dedicated destination exploration page
- Filter by region and type
- Card-based layout with images
- Responsive design

## Installation

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run development server

```bash
npm run dev
```

Frontend will run at: `http://localhost:3000`

## Directory Structure

```
frontend/
├── app/
│   ├── page.tsx              # Home page
│   ├── destinations/
│   │   └── page.tsx          # Destination discovery page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── chat-area.tsx         # Main chat interface
│   ├── chat-message.tsx      # Message bubble component
│   ├── sidebar.tsx           # Sidebar with conversations
│   ├── welcome-screen.tsx    # Welcome screen
│   └── language-toggle.tsx   # Language switcher
├── contexts/
│   └── language-context.tsx  # Language context provider
├── lib/
│   ├── api-client.ts         # Backend API client
│   └── utils.ts              # Utilities
└── public/                   # Static assets
```

## Components

### ChatArea
Main chat interface component:
- Handles message sending/receiving
- Manages conversation state
- Displays messages with TTS controls
- Shows follow-up questions

Props:
```typescript
interface ChatAreaProps {
  conversationId?: string;
  onConversationChange?: (id: string) => void;
}
```

### ChatMessage
Individual message bubble:
- Renders markdown for assistant messages
- TTS button with audio playback
- Different styling for user/assistant

Props:
```typescript
interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
  };
  language: "vi" | "en";
}
```

### Sidebar
Navigation sidebar:
- List conversations
- New chat button
- Language toggle
- Link to destinations page

Props:
```typescript
interface SidebarProps {
  onConversationSelect?: (conversationId: string) => void;
  onNewChat?: () => void;
  activeConversationId?: string;
}
```

## API Client

File `lib/api-client.ts` provides typed API client:

```typescript
import { apiClient } from "@/lib/api-client";

// Send chat message
const response = await apiClient.sendMessage({
  message: "Hello",
  conversation_id: "uuid",
  language: "vi"
});

// Get conversations
const conversations = await apiClient.getConversations();

// Text-to-speech
const audioBlob = await apiClient.textToSpeech(text, "vi");

// Get destinations
const destinations = await apiClient.getDestinations({
  region: "north",
  language: "vi"
});
```

## Styling

Project uses Tailwind CSS with custom color scheme:

- `--primary`: Primary brand color
- `--background`: Background color
- `--foreground`: Text color
- `--muted`: Muted elements
- `--border`: Border color

Dark mode is automatically supported.

## Build and Deploy

### Build for production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect GitHub repo with Vercel for auto-deploy.

## Troubleshooting

### API connection error
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running
- Check CORS settings in backend

### Build errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript errors
```bash
npm run lint
```

## License

MIT

