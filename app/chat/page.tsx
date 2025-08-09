'use client';

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { InviteButton } from '../components/InviteButton';
import { PendingInvites } from '../components/PendingInvites';
import { ChatMessages } from '../components/ChatMessages';
import { NewChatModal } from '../components/NewChatModal';
import { useRouter } from "next/navigation";
import { Id } from '../../convex/_generated/dataModel';

interface Chat {
  _id: Id<"chat">;
  participants: Id<"users">[];
  lastMessage: {
    userId: Id<"users">;
    body: string;
  };
  createdBy: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChatId, setSelectedChatId] = useState<Id<"chat"> | null>(null);
  const [message, setMessage] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  
  const chats = useQuery(api.chats.listChats, 
    session?.user?.id ? { userId: session.user.id as Id<"users"> } : "skip"
  );
  const sendMessage = useMutation(api.messages.sendMessage);
  const users = useQuery(api.chats.getAllUsers, {});

  // Show loading state while NextAuth is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to sign-in if user is not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handleSendMessage = async () => {
    if (!selectedChatId || !session?.user?.id || !message.trim()) return;

    try {
      await sendMessage({
        chat: selectedChatId,
        body: message.trim(),
        sender: session.user.id as Id<"users">,
      });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleChatCreated = (chatId: Id<"chat">) => {
    setSelectedChatId(chatId);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const getUserName = (userId: Id<"users">) => {
    const user = users?.find(u => u._id === userId);
    return user?.name || user?.email || "Unknown User";
  };

  const selectedChat = chats?.find(chat => chat._id === selectedChatId);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">ChatApp</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {session?.user?.name || session?.user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main chat interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Chat list */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Your Chats</h2>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                onClick={() => setShowNewChatModal(true)}
              >
                New Chat
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {chats?.length === 0 ? (
              <div className="text-gray-500 text-center py-8 px-4">
                <div className="text-4xl mb-4">💬</div>
                <div className="text-lg font-medium mb-2">No chats yet</div>
                <div className="text-sm">Create your first chat to get started!</div>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {chats?.map((chat: Chat) => (
                  <div
                    key={chat._id}
                    onClick={() => setSelectedChatId(chat._id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChatId === chat._id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">
                      {chat.participants
                        .filter(p => p !== session?.user?.id)
                        .map(p => getUserName(p))
                        .join(', ') || 'Personal Chat'}
                    </div>
                    <div className="text-sm text-gray-600 truncate mb-1">
                      {chat.lastMessage.body}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(chat.updatedAt).toLocaleDateString()} at {new Date(chat.updatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {selectedChatId && selectedChat ? (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedChat.participants
                        .filter(p => p !== session?.user?.id)
                        .map(p => getUserName(p))
                        .join(', ') || 'Personal Chat'}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {selectedChat.participants.length} participant{selectedChat.participants.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <InviteButton chatId={selectedChatId} />
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 bg-gray-50">
                <ChatMessages chatId={selectedChatId} />
              </div>

              {/* Message input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-blue-600 text-white rounded-full px-6 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Welcome to ChatApp</h3>
                <p className="text-gray-500 mb-6">Select a chat from the sidebar to start messaging</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating components */}
      <PendingInvites />

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        currentUserId={session?.user?.id || ""}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
} 