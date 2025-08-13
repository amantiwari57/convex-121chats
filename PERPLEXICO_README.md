# Perplexico AI Chat Integration

This document describes the AI chat feature "Perplexico" that has been integrated into your ChatApp. Perplexico is a Perplexity-like AI research assistant that provides comprehensive answers with web search capabilities and source citations.

## Features

- **AI-powered Chat**: Intelligent conversations using Google's Gemini AI model
- **Web Search Integration**: Searches the web for current information
- **Source Citations**: Provides reliable sources for all answers
- **Follow-up Questions**: Suggests relevant follow-up questions
- **Chat Management**: Create, manage, and organize multiple AI chat sessions
- **Real-time UI**: Modern, responsive interface with typing indicators
- **Secure**: User-specific chats with proper authentication

## Architecture

### Database Schema (Convex)
- `aiChats`: Stores AI chat sessions
- `aiMessages`: Stores individual messages with AI responses and sources
- `aiSearchResults`: Caches search results for performance

### API Routes
- `/api/ai-chat`: Handles AI chat requests and responses

### Components
- `PerplexicoChat`: Main chat interface component
- Navigation integration in existing chat pages

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file based on `env.example` and add the following API keys:

```bash
# Required for AI functionality
GEMINI_API_KEY=your_google_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here  # Optional

# Required for web search
SEARCH_API_KEY=7e16274b-a04f-4aba-acfa-42f5529e6faf  # Pre-configured
SEARCH_BASE_URL=https://search.dualdevs.in/search

# Existing variables (keep as-is)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
CONVEX_DEPLOYMENT=your_convex_deployment
```

### 2. Get Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env.local` file as `GEMINI_API_KEY`

### 3. Deploy Database Schema

The Convex schema has been updated with AI chat tables. Run:

```bash
npm run dev:backend
```

This will deploy the updated schema to your Convex backend.

### 4. Install Dependencies

The required dependencies have been added:

```bash
npm install @langchain/anthropic @langchain/langgraph @langchain/core @langchain/google-genai zod dotenv
```

## Usage

### Accessing Perplexico

1. **From Navigation**: Click "Perplexico AI" in the header navigation
2. **Direct URL**: Navigate to `/perplexico`
3. **From Landing Page**: New feature card links to Perplexico

### Using the AI Chat

1. **Start New Chat**: Click the "+" button or "Start New Chat"
2. **Ask Questions**: Type any question and get comprehensive AI responses
3. **View Sources**: Each AI response includes clickable source citations
4. **Follow-up Questions**: Click suggested questions for deeper exploration
5. **Manage Chats**: Edit titles, delete chats, or create new conversations

### Example Queries

- "What are the latest developments in artificial intelligence?"
- "How does quantum computing work?"
- "Compare React vs Vue.js for web development"
- "What's the current state of renewable energy technology?"

## Technical Implementation

### Current Implementation (Full LangChain/LangGraph)

The implementation now includes:
- ✅ Complete UI/UX with modern design
- ✅ Database schema and Convex functions
- ✅ Chat management (create, delete, edit)
- ✅ Message history and persistence
- ✅ Navigation integration
- ✅ **Full LangChain/LangGraph integration**
- ✅ **Real AI agent with tool-calling capabilities**
- ✅ **Advanced web search with multiple strategies**
- ✅ **Structured response parsing and analysis**

### Production Mode (With API Keys)

When you add the required API keys, the system will:
- ✅ Use LangGraph React Agent for complex reasoning
- ✅ Use real Google Gemini AI for intelligent responses
- ✅ Perform actual web searches for current information
- ✅ Provide real source citations from search results
- ✅ Generate contextual follow-up questions
- ✅ Save search results and analysis to files

### Code Structure

```
app/
├── perplexico/page.tsx          # Main Perplexico page
├── api/ai-chat/
│   ├── route.ts                 # Clean API endpoint
│   ├── agent.ts                 # LangGraph agent setup
│   ├── tools.ts                 # LangChain tools (search & analysis)
│   ├── search-parser.ts         # HTML/JSON parsing utilities
│   ├── response-processor.ts    # Response processing logic
│   └── types.ts                 # TypeScript interfaces
components/components/
├── PerplexicoChat.tsx           # Main chat component
convex/
├── ai.ts                        # Convex functions for AI chat
├── schema.ts                    # Updated database schema
```

## Features Overview

### 1. Chat Interface
- Clean, modern design similar to ChatGPT/Perplexity
- Real-time message updates
- Typing indicators and loading states
- Mobile-responsive design

### 2. Source Citations
- Each AI response includes numbered source citations
- Clickable links to original sources
- Source previews with titles and descriptions
- Domain-based source identification

### 3. Chat Management
- Create multiple chat sessions
- Edit chat titles inline
- Delete conversations
- Automatic chat naming based on first message

### 4. Search Integration
- Web search for current information
- Multiple search strategies for reliability
- Cached results for performance
- Fallback handling for failed searches

### 5. Follow-up Questions
- AI-generated follow-up questions
- Context-aware suggestions
- One-click question submission

## Development Notes

### Demo vs Production Mode

The current implementation works in demo mode without API keys. To enable full functionality:

1. Add `GEMINI_API_KEY` for AI responses
2. The search functionality is pre-configured and should work
3. Optionally add `ANTHROPIC_API_KEY` for alternative AI models

### LangChain/LangGraph Integration

The system now fully implements:
- **LangGraph React Agent**: Advanced agent with tool-calling capabilities
- **Custom Search Tools**: Perplexity-style web search with multiple strategies
- **AI Analysis Tools**: Structured analysis of search results
- **Multiple AI Models**: Google Gemini (primary), Anthropic Claude (optional)
- **Tool Orchestration**: Automatic tool selection and chaining
- **Response Parsing**: Extraction of sources and follow-up questions
- **File System Integration**: Automatic saving of search results and analysis

#### Agent Architecture

```typescript
// LangGraph React Agent with custom tools
const agent = createReactAgent({
  llm: model,  // Google Gemini
  tools: [
    perplexitySearchTool,  // Web search with multiple strategies
    aiAnalysisTool         // Structured analysis and summary
  ],
});
```

#### Tool Flow

1. **User Query** → LangGraph Agent
2. **Agent Decision** → Calls `perplexitySearchTool`
3. **Search Execution** → Multiple search strategies (Form + JSON)
4. **Result Parsing** → HTML/JSON to structured data
5. **Analysis Tool** → `aiAnalysisTool` processes results
6. **Response Generation** → Structured response with sources
7. **UI Display** → Sources, follow-up questions, citations

### Security Considerations

- User authentication via Clerk
- User-specific chat isolation
- API key protection in environment variables
- Input validation and sanitization

## Troubleshooting

### Common Issues

1. **Chat not loading**: Check if user is authenticated
2. **AI responses not working**: Verify `GEMINI_API_KEY` in environment
3. **Search not working**: Check network connectivity and search API
4. **Database errors**: Ensure Convex schema is deployed

### Debug Mode

To enable debug logging, check the browser console and server logs for detailed information about:
- Search requests and responses
- AI model interactions
- Database operations
- Error messages

## Future Enhancements

Potential improvements for the future:

1. **Streaming Responses**: Real-time AI response streaming
2. **Image Search**: Support for image-based queries
3. **Voice Input**: Speech-to-text integration
4. **Export Features**: Save conversations as PDF/markdown
5. **Advanced Filters**: Filter sources by date, domain, type
6. **Collaborative Features**: Share conversations with other users
7. **Custom Prompts**: User-defined AI behavior templates
8. **Analytics**: Usage statistics and insights

## Support

For questions or issues:

1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check Convex deployment status

The integration is now complete and ready for use! Users can access Perplexico through the navigation menu and start having AI-powered conversations with web search capabilities.
