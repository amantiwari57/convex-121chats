"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Send, Bot, User, ExternalLink } from "lucide-react";

interface Message {
  _id: Id<"perplexicoMessages">;
  userId: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    title: string;
    url: string;
    content: string;
    source: string;
  }>;
  followUpQuestions?: string[];
  searchQuery?: string;
  createdAt: number;
}

export default function PerplexicoChat() {
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [streamingStatus, setStreamingStatus] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Convex queries and mutations for single shared chat
  const messages = useQuery(api.ai.getPerplexicoMessages, { limit: 100 });
  const addMessage = useMutation(api.ai.addPerplexicoMessage);
  
  // Get user name for display
  const getUserName = (userId: string) => {
    if (userId === "system") return "Perplexico";
    if (userId === user?.id) return "You";
    return "User";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || !user?.id) return;

    const userMessage = message;
    setMessage("");
    setIsLoading(true);
    setStreamingMessage("");
    setStreamingStatus("");

    try {
      // Add user message to shared chat
      await addMessage({
        role: "user",
        content: userMessage,
        userId: user.id,
      });

      // Send to AI API with streaming
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";
      let sources: any[] = [];
      let followUpQuestions: string[] = [];

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  break;
                }

                try {
                  const parsed = JSON.parse(data);
                  
                  if (parsed.type === "start") {
                    setStreamingStatus(parsed.message);
                  } else if (parsed.type === "search") {
                    setStreamingStatus(parsed.message);
                  } else if (parsed.type === "analysis") {
                    setStreamingStatus(parsed.message);
                  } else if (parsed.type === "content") {
                    streamedContent = parsed.content;
                    setStreamingMessage(parsed.content);
                    setStreamingStatus("Generating response...");
                  } else if (parsed.type === "complete") {
                    streamedContent = parsed.response;
                    sources = parsed.sources || [];
                    followUpQuestions = parsed.followUpQuestions || [];
                    setStreamingStatus("");
                    setStreamingMessage("");
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      // Add final AI response to shared chat
      await addMessage({
        role: "assistant",
        content: streamedContent,
        userId: "system", // AI responses are from system
        sources: sources.length > 0 ? sources : undefined,
        followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
        searchQuery: userMessage,
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      // Add error message
      await addMessage({
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        userId: "system",
      });
    } finally {
      setIsLoading(false);
      setStreamingMessage("");
      setStreamingStatus("");
    }
  };



  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Please sign in to use Perplexico AI Chat</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Perplexico</h1>
              <p className="text-sm text-gray-600">AI-powered research assistant</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages?.map((msg) => (
            <div key={msg._id} className="flex gap-4">
              <div className="flex-shrink-0">
                {msg.role === "user" ? (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {getUserName(msg.userId)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-800">
                      {msg.content}
                    </pre>
                  </div>
                      
                      {/* Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Sources:</h4>
                          <div className="space-y-2">
                            {msg.sources.map((source, index) => (
                              <a
                                key={index}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-blue-600 truncate">
                                    {source.title}
                                  </p>
                                  <p className="text-xs text-gray-500">{source.source}</p>
                                  {source.content && (
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                      {source.content}
                                    </p>
                                  )}
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follow-up Questions */}
                      {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Follow-up Questions:</h4>
                          <div className="space-y-1">
                            {msg.followUpQuestions.map((question, index) => (
                              <button
                                key={index}
                                onClick={() => setMessage(question)}
                                className="block text-left text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                        <span className="text-gray-600">
                          {streamingStatus || "Processing your question..."}
                        </span>
                      </div>
                      {streamingMessage && (
                        <div className="text-gray-800 text-sm">
                          <div className="bg-gray-50 rounded p-2 border-l-4 border-purple-500">
                            <div className="whitespace-pre-wrap">{streamingMessage}</div>
                            <div className="animate-pulse inline-block w-2 h-4 bg-purple-500 ml-1"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex gap-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Perplexico anything..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Perplexico can search the web and provide comprehensive answers with sources.
            </p>
          </div>
        </div>
      </div>
    );
}
