import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Doc } from "../../convex/_generated/dataModel";
import { useEffect, useRef, useCallback, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { CheckCheck } from "lucide-react";

export function ChatMessages({ chatId }: { chatId: Id<"chat"> }) {
  const { user } = useUser();
  const messages = useQuery(api.messages.getMessages, { chat: chatId, page: 1 });
  const users = useQuery(api.chats.getAllUsers, {});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Debounced function to mark messages as read
  const debouncedMarkAsRead = useCallback(() => {
    if (user?.id && chatId && isVisible) {
      const timeoutId = setTimeout(() => {
        markMessagesAsRead({
          chat: chatId,
          userId: user.id,
        });
      }, 1000); // 1 second delay to avoid too frequent calls

      return timeoutId;
    }
  }, [user?.id, chatId, isVisible, markMessagesAsRead]);

  // Mark messages as read when messages load or change and page is visible
  useEffect(() => {
    if (messages && messages.length > 0 && isVisible) {
      const timeoutId = debouncedMarkAsRead();
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  }, [messages, isVisible, debouncedMarkAsRead]);

  const getUserName = (userId: string) => {
    const user = users?.find(u => u.clerkId === userId);
    return user?.name || user?.email || "Unknown User";
  };

  const isMessageRead = (message: Doc<"messages">) => {
    // Only show read receipts for current user's own messages
    if (message.sender !== user?.id) return false;
    
    // Check if message has been read by anyone other than the sender
    const readByOthers = message.readBy?.some(read => read.userId !== message.sender);
    return readByOthers || false;
  };

  const isMessageUnread = (message: Doc<"messages">) => {
    // Only check unread status for messages from others
    if (message.sender === user?.id) return false;
    
    // Check if current user has read this message
    const readByCurrentUser = message.readBy?.some(read => read.userId === user?.id);
    return !readByCurrentUser;
  };

  if (!messages) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-gray-600">Loading messages...</div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <div className="text-lg font-medium text-black mb-2">Start the conversation!</div>
          <div className="text-gray-600">Send your first message to get things started.</div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 w-full">
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message: Doc<"messages">, index: number) => {
          const isCurrentUser = message.sender === user?.id;
          const showUserName = index === 0 || messages[index - 1]?.sender !== message.sender;
          const nextMessageSameSender = index < messages.length - 1 && messages[index + 1]?.sender === message.sender;
          const messageUnread = isMessageUnread(message);
          
          return (
            <div key={message._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${isCurrentUser ? "order-2" : "order-1"}`}>
                {!isCurrentUser && showUserName && (
                  <div className="text-xs text-gray-600 mb-1 px-2">
                    {getUserName(message.sender)}
                  </div>
                )}
                <div
                  className={`
                    px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-sm relative
                    ${isCurrentUser 
                      ? "bg-black text-white ml-auto" 
                      : messageUnread
                      ? "bg-blue-50 text-black border border-blue-200 shadow-md"
                      : "bg-white text-black border border-gray-200"
                    }
                    ${showUserName ? "rounded-t-lg" : ""}
                    ${!nextMessageSameSender ? "rounded-b-lg" : ""}
                    ${!showUserName && nextMessageSameSender ? "rounded-none" : ""}
                  `}
                >
                  {messageUnread && !isCurrentUser && (
                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
                  )}
                  <div className="text-sm sm:text-base break-words leading-relaxed">
                    {message.body}
                  </div>
                  {message.mediaUrl && (
                    <div className="mt-2">
                      {message.mediaType === 'image' ? (
                        <img 
                          src={message.mediaUrl} 
                          alt={message.fileName || 'Shared image'}
                          className="max-w-xs sm:max-w-sm md:max-w-md h-auto rounded-md border border-gray-200"
                          loading="lazy"
                        />
                      ) : message.mediaType === 'video' ? (
                        <video 
                          src={message.mediaUrl} 
                          controls 
                          className="max-w-xs sm:max-w-sm md:max-w-md h-auto rounded-md border border-gray-200"
                          preload="metadata"
                        />
                      ) : null}
                    </div>
                  )}
                  <div 
                    className={`text-xs mt-1 flex items-center gap-1 ${
                      isCurrentUser ? "text-gray-300 justify-end" : "text-gray-500"
                    }`}
                  >
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {isCurrentUser && (
                      <CheckCheck 
                        className={`h-3 w-3 ${
                          isMessageRead(message) ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
} 