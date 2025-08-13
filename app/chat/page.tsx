'use client';

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { InviteButton } from '../../components/components/InviteButton';
import { PendingInvites } from '../../components/components/PendingInvites';
import { ChatMessages } from '../../components/components/ChatMessages';
import { NewChatModal } from '../../components/components/NewChatModal';
import { UserProfileModal } from '../../components/components/UserProfileModal';
import { FileUpload } from '../../components/components/FileUpload';
import { useRouter } from "next/navigation";
import { Id } from '../../convex/_generated/dataModel';

interface Chat {
  _id: Id<"chat">;
  participants: string[]; // Clerk user IDs
  lastMessage: {
    userId: string; // Clerk user ID
    body: string;
  };
  createdBy: string; // Clerk user ID
  createdAt: number;
  updatedAt: number;
}

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [selectedChatId, setSelectedChatId] = useState<Id<"chat"> | null>(null);
  const [message, setMessage] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const createOrUpdateUser = useMutation(api.auth.createOrUpdateUser);
  const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead);
  
  const chats = useQuery(api.chats.listChats, 
    user?.id ? { userId: user.id } : "skip"
  );
  const sendMessage = useMutation(api.messages.sendMessage);
  const users = useQuery(api.chats.getAllUsers, {});

  // Create or update user in Convex when user loads
  useEffect(() => {
    if (user?.id && user?.emailAddresses?.[0]?.emailAddress) {
      createOrUpdateUser({
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName || user.firstName || user.emailAddresses[0].emailAddress,
      });
    }
  }, [user, createOrUpdateUser]);

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  // Redirect to sign-in if user is not authenticated
  if (!user) {
    router.push("/auth/signin");
    return null;
  }

  const handleSendMessage = async (mediaUrl?: string, mediaType?: string, fileName?: string) => {
    if (!selectedChatId || !user?.id || (!message.trim() && !mediaUrl)) return;

    try {
      await sendMessage({
        chat: selectedChatId,
        body: message.trim() || (mediaUrl ? '' : ''),
        sender: user.id,
        mediaUrl,
        mediaType,
        fileName,
      });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUpload = (mediaUrl: string, mediaType: string, fileName: string) => {
    handleSendMessage(mediaUrl, mediaType, fileName);
  };

  const handleChatCreated = (chatId: Id<"chat">) => {
    setSelectedChatId(chatId);
  };

  const handleSignOut = () => {
    signOut(() => router.push("/"));
  };

  const handleSelectChat = (chatId: Id<"chat">) => {
    setSelectedChatId(chatId);
    // Mark messages as read when selecting a chat
    if (user?.id) {
      markMessagesAsRead({
        chat: chatId,
        userId: user.id,
      });
    }
  };

  const getUserName = (userId: string) => {
    const convexUser = users?.find(u => u.clerkId === userId);
    return convexUser?.name || convexUser?.email || "Unknown User";
  };

  const selectedChat = chats?.find(chat => chat._id === selectedChatId);

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-black border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-white hover:text-gray-300 transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-white">ChatApp</h1>
            <nav className="hidden md:flex items-center gap-4">
              <button
                onClick={() => router.push("/chat")}
                className="text-white hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium"
              >
                Chat
              </button>
              <button
                onClick={() => router.push("/perplexico")}
                className="text-white hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Perplexico AI
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowProfileModal(true)}
              className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm hidden sm:inline">
                {user?.fullName || user?.emailAddresses[0]?.emailAddress}
              </span>
            </button>
            <button
              onClick={handleSignOut}
              className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-md text-sm transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Chat list */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative inset-y-0 left-0 z-30 w-80 bg-gray-50 border-r border-gray-300 flex flex-col min-w-0 transition-transform duration-300 ease-in-out`}>
          <div className="p-4 border-b border-gray-300 bg-white flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden text-gray-500 hover:text-gray-700 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold text-black">Conversations</h2>
              </div>
              <button
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm transition-colors font-medium"
                onClick={() => setShowNewChatModal(true)}
              >
                + New Chat
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Perplexico AI Chat */}
            <div className="p-2 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <button
                onClick={() => router.push("/perplexico")}
                className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-3 shadow-sm"
              >
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Perplexico AI</div>
                  <div className="text-xs text-white text-opacity-80">AI-powered research assistant</div>
                </div>
                <div className="ml-auto">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Personal Chats</h3>
            </div>
            
            {chats?.length === 0 ? (
              <div className="text-gray-600 text-center py-8 px-4">
                <div className="text-4xl mb-4">💬</div>
                <div className="text-lg font-medium mb-2 text-black">No conversations yet</div>
                <div className="text-sm">Start your first conversation!</div>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {chats?.map((chat: Chat) => (
                  <div
                    key={chat._id}
                    onClick={() => handleSelectChat(chat._id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      selectedChatId === chat._id 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    <div className={`font-medium mb-1 ${selectedChatId === chat._id ? 'text-white' : 'text-black'}`}>
                      {chat.participants
                        .filter(p => p !== user?.id)
                        .map(p => getUserName(p))
                        .join(', ') || 'Personal Chat'}
                    </div>
                    <div className={`text-sm truncate mb-1 ${selectedChatId === chat._id ? 'text-gray-300' : 'text-gray-600'}`}>
                      {chat.lastMessage.body}
                    </div>
                    <div className={`text-xs ${selectedChatId === chat._id ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(chat.updatedAt).toLocaleDateString()} at {new Date(chat.updatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedChatId && selectedChat ? (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-gray-300 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-black">
                      {selectedChat.participants
                        .filter(p => p !== user?.id)
                        .map(p => getUserName(p))
                        .join(', ') || 'Personal Chat'}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {selectedChat.participants.length} participant{selectedChat.participants.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <InviteButton chatId={selectedChatId} />
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 bg-gray-50 min-h-0 flex flex-col">
                <ChatMessages chatId={selectedChatId} />
              </div>

              {/* Message input */}
              <div className="bg-white border-t border-gray-300 p-3 sm:p-4 flex-shrink-0">
                <div className="flex items-end space-x-2 sm:space-x-3">
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    disabled={!selectedChatId}
                  />
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border text-black border-gray-300 px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm sm:text-base"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!message.trim()}
                    className="bg-black text-white rounded-lg px-4 py-2 sm:px-6 sm:py-3 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
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
                <h3 className="text-xl font-semibold text-black mb-2">Welcome to ChatApp</h3>
                <p className="text-gray-600 mb-6">Select a conversation to start messaging</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Start New Conversation
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
        currentUserId={user?.id || ""}
        onChatCreated={handleChatCreated}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
} 