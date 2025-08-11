import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Doc } from "../../convex/_generated/dataModel";
import { useEffect, useRef } from "react";
import { ScrollArea } from "../ui/scroll-area";

export function ChatMessages({ chatId }: { chatId: Id<"chat"> }) {
  const { user } = useUser();
  const messages = useQuery(api.messages.getMessages, { chat: chatId, page: 1 });
  const users = useQuery(api.chats.getAllUsers, {});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getReadStatus = (message: Doc<"messages">) => {
    if (!message.readBy || message.sender === user?.id) return null;
    
    const readCount = message.readBy.length;
    if (readCount === 0) return "Sent";
    if (readCount === 1) return "Read";
    return `Read by ${readCount}`;
  };

  const getUserName = (userId: string) => {
    const convexUser = users?.find(u => u.clerkId === userId);
    return convexUser?.name || convexUser?.email || "Unknown User";
  };

  if (!messages) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-gray-600">Loading messages...</div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <div className="text-lg font-semibold text-black mb-2">Start the conversation!</div>
          <div className="text-gray-600">Send your first message to get things started.</div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="p-4 space-y-4 min-h-full">
        {messages.map((message: Doc<"messages">, index: number) => {
          const isCurrentUser = message.sender === user?.id;
          const showUserName = index === 0 || messages[index - 1]?.sender !== message.sender;
          const nextMessageSameSender = index < messages.length - 1 && messages[index + 1]?.sender === message.sender;
          
          const readStatus = getReadStatus(message);
          
          return (
            <div key={message._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] ${isCurrentUser ? "order-2" : "order-1"}`}>
                {!isCurrentUser && showUserName && (
                  <div className="text-xs text-gray-600 mb-1 px-2 font-medium">
                    {getUserName(message.sender)}
                  </div>
                )}
                <div
                  className={`
                    px-4 py-3 rounded-2xl
                    ${isCurrentUser 
                      ? "bg-black text-white ml-auto" 
                      : "bg-white text-black border border-gray-300"
                    }
                    ${showUserName ? "rounded-t-2xl" : ""}
                    ${!nextMessageSameSender ? "rounded-b-2xl" : ""}
                    ${!showUserName && nextMessageSameSender ? "rounded-none" : ""}
                  `}
                >
                  <div className="text-sm break-words">
                    {message.body}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div 
                      className={`text-xs ${
                        isCurrentUser ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    {isCurrentUser && readStatus && (
                      <div className={`text-xs ${
                        readStatus === "Read" || readStatus.startsWith("Read by") 
                          ? "text-gray-300" 
                          : "text-gray-400"
                      }`}>
                        {readStatus === "Read" || readStatus.startsWith("Read by") ? "✓✓" : "✓"} {readStatus}
                      </div>
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