import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Doc } from "../../convex/_generated/dataModel";
import { useEffect, useRef } from "react";

export function ChatMessages({ chatId }: { chatId: Id<"chat"> }) {
  const { user } = useUser();
  const messages = useQuery(api.messages.getMessages, { chat: chatId, page: 1 });
  const users = useQuery(api.chats.getAllUsers, {});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getUserName = (userId: string) => {
    const user = users?.find(u => u.clerkId === userId);
    return user?.name || user?.email || "Unknown User";
  };

  if (!messages) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Loading messages...</div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <div className="text-lg font-medium text-gray-900 mb-2">Start the conversation!</div>
          <div className="text-gray-500">Send your first message to get things started.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message: Doc<"messages">, index: number) => {
        const isCurrentUser = message.sender === user?.id;
        const showUserName = index === 0 || messages[index - 1]?.sender !== message.sender;
        // const isLastMessage = index === messages.length - 1; // unused for now
        const nextMessageSameSender = index < messages.length - 1 && messages[index + 1]?.sender === message.sender;
        
        return (
          <div key={message._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] ${isCurrentUser ? "order-2" : "order-1"}`}>
              {!isCurrentUser && showUserName && (
                <div className="text-xs text-gray-500 mb-1 px-2">
                  {getUserName(message.sender)}
                </div>
              )}
              <div
                className={`
                  px-4 py-2 rounded-lg
                  ${isCurrentUser 
                    ? "bg-blue-600 text-white ml-auto" 
                    : "bg-white text-gray-900 border border-gray-200"
                  }
                  ${showUserName ? "rounded-t-lg" : ""}
                  ${!nextMessageSameSender ? "rounded-b-lg" : ""}
                  ${!showUserName && nextMessageSameSender ? "rounded-none" : ""}
                `}
              >
                <div className="text-sm break-words">
                  {message.body}
                </div>
                <div 
                  className={`text-xs mt-1 ${
                    isCurrentUser ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
} 