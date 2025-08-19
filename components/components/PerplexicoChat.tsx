"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Send, Bot, User, ExternalLink, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatInput, ChatInputTextArea, ChatInputSubmit, ChatInputUpload } from "@/components/ui/chat-input";

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
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Array<{url: string, fileName: string, fileType: string}>>([]);

  // Convex queries and mutations for single shared chat
  const messages = useQuery(
    api.ai.getPerplexicoMessages, 
    user?.id ? { userId: user.id, limit: 100 } : "skip"
  );
  const addMessage = useMutation(api.ai.addPerplexicoMessage);
  const credits = useQuery(
    api.ai.getPerplexicoCredits,
    user?.id ? { userId: user.id } : "skip",
  );
  


  // Get user name for display
  const getUserName = (userId: string, role: string) => {
    if (role === "assistant") return "Perplexico";
    if (userId === user?.id) return "You";
    return "User";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImageUpload = (url: string, info: { fileName: string; fileType: string }) => {
    setUploadedImages(prev => [...prev, { url, fileName: info.fileName, fileType: info.fileType }]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!message.trim() && uploadedImages.length === 0) || isLoading || !user?.id) return;

    const userMessage = message;
    const imageUrls = uploadedImages.map(img => img.url);
    setMessage("");
    setUploadedImages([]);
    setIsLoading(true);
    setStreamingMessage("");
    setStreamingStatus("");
    setLocalError(null);

    try {
      // Create content for user message that includes images
      let userContent = userMessage;
      if (uploadedImages.length > 0) {
        const imageSection = uploadedImages.map((img, index) => 
          `![${img.fileName}](${img.url})`
        ).join('\n\n');
        userContent = userMessage ? `${userMessage}\n\n${imageSection}` : imageSection;
      }

      // Add user message to shared chat
      await addMessage({
        role: "user",
        content: userContent,
        userId: user.id,
      });

      // Send to AI API with streaming, including image URLs
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: userMessage || "Please analyze the uploaded image(s)", 
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          userId: user.id 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";
      let sources: Array<{ title: string; url: string; content: string; source: string }> = [];
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
                } catch (_e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      // Add final AI response to user's conversation
      await addMessage({
        role: "assistant",
        content: streamedContent,
        userId: user.id, // AI responses belong to the user who asked the question
        sources: sources.length > 0 ? sources : undefined,
        followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
        searchQuery: userMessage,
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      setLocalError(error instanceof Error ? error.message : "Request failed");
      // Add error message
      await addMessage({
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        userId: user.id, // Error messages also belong to the user
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
    <div className="flex h-[100dvh] w-full bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full max-w-none">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Perplexico</h1>
              <p className="text-xs sm:text-sm text-gray-600">AI-powered research assistant</p>
            </div>
            <div className="text-xs text-gray-600 flex items-center gap-1 sm:gap-2">
              {credits && (
                <>
                  <span className="whitespace-nowrap">
                    Daily: {credits.remaining.daily}/{credits.limits.daily}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  {/* <span className="whitespace-nowrap">
                    /Min: {credits.remaining.perMinute}/{credits.limits.perMinute}
                  </span> */}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 w-full">
          {messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg._id} className="flex gap-2 sm:gap-4 w-full">
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
                      {getUserName(msg.userId, msg.role)}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 w-full max-w-none">
                    <div className="prose prose-sm max-w-none">
                      {msg.role === "assistant" ? (
                        <div className="whitespace-pre-wrap break-words text-gray-800">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              table: ({ children }) => (
                                <div className="overflow-x-auto my-4 w-full">
                                  <table className="w-full divide-y divide-gray-200 border border-gray-300 rounded-lg text-xs sm:text-sm">
                                    {children}
                                  </table>
                                </div>
                              ),
                              thead: ({ children }) => (
                                <thead className="bg-gray-50">{children}</thead>
                              ),
                              tbody: ({ children }) => (
                                <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
                              ),
                              tr: ({ children }) => (
                                <tr className="hover:bg-gray-50">{children}</tr>
                              ),
                              th: ({ children }) => (
                                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => (
                                <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 border-r border-gray-200 last:border-r-0 break-words">
                                  {children}
                                </td>
                              ),
                              img: ({ src, alt }) => (
                                <img 
                                  src={src} 
                                  alt={alt} 
                                  className="max-w-full h-auto rounded-lg shadow-sm my-2"
                                  loading="lazy"
                                />
                              ),
                              a: ({ href, children }) => (
                                <a 
                                  href={href} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline"
                                >
                                  {children}
                                </a>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="text-gray-800">{children}</li>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-2">
                                  {children}
                                </blockquote>
                              ),
                              code: ({ children, className }) => {
                                const isInline = !className;
                                return isInline ? (
                                  <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                                    {children}
                                  </code>
                                ) : (
                                  <code className="block bg-gray-100 p-2 rounded text-sm font-mono overflow-x-auto">
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-sans text-gray-800">
                          {msg.content}
                        </pre>
                      )}
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
            ))
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">No messages yet. Start a conversation with Perplexico!</p>
            </div>
          )}
          
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
          <div className="p-2 sm:p-4 md:p-6 border-t border-gray-200 bg-white w-full">
            {/* Image Preview Section */}
            {uploadedImages.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Images ({uploadedImages.length})</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300 bg-white">
                        <img 
                          src={image.url} 
                          alt={image.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate w-20" title={image.fileName}>
                        {image.fileName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <ChatInput
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onSubmit={handleSendMessage}
              loading={isLoading}
              rows={1}
              className="w-full max-w-none"
            >
              <div className="flex items-end gap-2 w-full">
                <ChatInputUpload
                  aria-label="Upload image"
                  title="Upload image"
                  onUploaded={handleImageUpload}
                />
                <div className="flex-1">
                  <ChatInputTextArea
                    placeholder={
                      credits && credits.remaining.daily === 0
                        ? "Daily limit reached. Try again later."
                        : credits && credits.remaining.perMinute === 0
                        ? "Rate limit reached. Wait a minute."
                        : uploadedImages.length > 0
                        ? "Ask about the uploaded image(s) or add a message..."
                        : "Ask Perplexico anything..."
                    }
                    disabled={isLoading || (credits ? credits.remaining.daily === 0 || credits.remaining.perMinute === 0 : false)}
                  />
                </div>
                <ChatInputSubmit aria-label="Send" />
              </div>
              {localError && (
                <p className="text-xs text-red-600 mt-2">{localError}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {uploadedImages.length > 0 
                  ? "Perplexico can analyze images and provide insights. Upload images and ask questions about them!"
                  : "Perplexico can search the web and provide comprehensive answers with sources."
                }
              </p>
            </ChatInput>
          </div>
        </div>
      </div>
    );
}
