'use client';

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { InviteButton } from '../../../components/components/InviteButton';
import { PendingInvites } from '../../../components/components/PendingInvites';
import { ChatMessages } from '../../../components/components/ChatMessages';
import { NewChatModal } from '../../../components/components/NewChatModal';
import { UserProfileModal } from '../../../components/components/UserProfileModal';
import { FileUpload } from '../../../components/components/FileUpload';
import { useRouter } from "next/navigation";
import { Id } from '../../../convex/_generated/dataModel';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

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

function ChatPageContent() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [selectedChatId, setSelectedChatId] = useState<Id<"chat"> | null>(null);
  const [message, setMessage] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileChatView, setShowMobileChatView] = useState(false);
  const { setOpenMobile } = useSidebar();
  
  const createOrUpdateUser = useMutation(api.auth.createOrUpdateUser);
  const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead);
  
  const chats = useQuery(api.chats.listChats, 
    user?.id ? { userId: user.id } : "skip"
  );
  const sendMessage = useMutation(api.messages.sendMessage);
  const users = useQuery(api.chats.getAllUsers, {});
  const unreadCounts = useQuery(api.messages.getUnreadCounts,
    user?.id ? { userId: user.id } : "skip"
  ) || {};
  const pendingInvites = useQuery(api.chats.getPendingInvites,
    user?.id ? { userId: user.id } : "skip"
  );

  // Create or update user in Convex when user loads
  useEffect(() => {
    if (user?.id && user?.emailAddresses?.[0]?.emailAddress) {
      createOrUpdateUser({
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName || user.firstName || user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
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
    setShowMobileChatView(true);
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
    // Auto close sidebar on mobile and show chat view
    setOpenMobile(false);
    setShowMobileChatView(true);
  };

  const handleBackToChats = () => {
    setShowMobileChatView(false);
    setSelectedChatId(null);
  };

  const getUserName = (userId: string) => {
    const convexUser = users?.find(u => u.clerkId === userId);
    return convexUser?.name || convexUser?.email || "Unknown User";
  };

  const getUserAvatar = (userId: string) => {
    const convexUser = users?.find(u => u.clerkId === userId);
    if (!convexUser) return null;
    
    // Access imageUrl from the user object
    const userWithImage = convexUser as typeof convexUser & { imageUrl?: string };
    return userWithImage.imageUrl || null;
  };

  const getChatAvatar = (participants: string[]) => {
    // Filter out current user and get first available avatar
    const otherParticipants = participants.filter(p => p !== user?.id);
    
    // Find first participant with an avatar
    for (const participantId of otherParticipants) {
      const avatarUrl = getUserAvatar(participantId);
      if (avatarUrl) {
        const userName = getUserName(participantId);
        return { avatarUrl, participantId, userName };
      }
    }
    
    // If no avatar found, return first participant's info for fallback
    const firstParticipant = otherParticipants[0];
    if (firstParticipant) {
      const userName = getUserName(firstParticipant);
      return { avatarUrl: null, participantId: firstParticipant, userName };
    }
    
    return { avatarUrl: null, participantId: null, userName: 'Unknown' };
  };

  const selectedChat = chats?.find(chat => chat._id === selectedChatId);

  return (
    <div className="h-screen w-full bg-white flex flex-col">
      {/* Header */}
      <header className="bg-black border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <SidebarTrigger className="md:hidden text-white hover:text-gray-300" />
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
            {/* Invite Requests Button */}
            {pendingInvites && pendingInvites.length > 0 && (
              <button
                onClick={() => router.push('/chat/invites')}
                className="relative text-white hover:text-gray-300 transition-colors flex items-center gap-2"
                title="View invite requests"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h5v14z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingInvites.length}
                </span>
              </button>
            )}
            
            <button
              onClick={() => setShowProfileModal(true)}
              className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "Profile"}
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
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

      <div className="flex-1 flex overflow-hidden w-full">
        {/* Mobile Chat List */}
        <div className={`w-full md:hidden ${showMobileChatView ? 'hidden' : 'flex'} flex-col bg-gray-50`}>
          <div className="bg-white border-b border-gray-300 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Chats</h2>
              <button
                className="bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm transition-colors font-medium"
                onClick={() => setShowNewChatModal(true)}
              >
                + New
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Pending Invites Section */}
            <PendingInvites showInSidebar={true} />
            
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

            {chats?.length === 0 ? (
              <div className="text-gray-600 text-center py-8 px-4">
                <div className="text-4xl mb-4">💬</div>
                <div className="text-lg font-medium mb-2 text-black">No conversations yet</div>
                <div className="text-sm">Start your first conversation!</div>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {chats?.map((chat: Chat) => {
                  const unreadCount = unreadCounts?.[chat._id] || 0;
                  const hasUnread = unreadCount > 0;
                  
                  return (
                    <div
                      key={chat._id}
                      onClick={() => handleSelectChat(chat._id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        hasUnread
                        ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 shadow-sm'
                        : 'bg-white hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {(() => {
                            const { avatarUrl, userName } = getChatAvatar(chat.participants);
                            
                            return avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={userName}
                                className="w-12 h-12 rounded-full border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        
                        {/* Chat info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-black truncate">
                              {chat.participants
                                .filter(p => p !== user?.id)
                                .map(p => getUserName(p))
                                .join(', ') || 'Personal Chat'}
                            </span>
                            {hasUnread && (
                              <div className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 bg-blue-600 text-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {chat.lastMessage.body}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(chat.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Chat View */}
        <div className={`w-full md:hidden ${showMobileChatView ? 'flex' : 'hidden'} flex-col`}>
          {selectedChatId && selectedChat ? (
            <>
              {/* Mobile Chat Header */}
              <div className="bg-white border-b border-gray-300 px-4 py-3 flex items-center gap-3">
                <button
                  onClick={handleBackToChats}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {(() => {
                  const { avatarUrl, userName } = getChatAvatar(selectedChat.participants);
                  
                  return avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userName}
                      className="w-10 h-10 rounded-full border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  );
                })()}
                <div className="flex-1">
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

              {/* Messages */}
              <div className="flex-1 bg-gray-50 min-h-0 flex flex-col w-full">
                <ChatMessages chatId={selectedChatId} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-300 p-3 flex-shrink-0 w-full">
                <div className="flex items-end space-x-2 w-full">
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
                    className="flex-1 rounded-lg border text-black border-gray-300 px-3 py-2 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!message.trim()}
                    className="bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Desktop Sidebar */}
        <Sidebar collapsible="offcanvas" className="hidden md:flex bg-gray-50 border-r border-gray-300">
          <SidebarHeader className="bg-white border-b border-gray-300">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold text-black">Conversations</h2>
              <button
                className="bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm transition-colors font-medium"
                onClick={() => setShowNewChatModal(true)}
              >
                + New Chat
              </button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                {/* Pending Invites Section */}
                <PendingInvites showInSidebar={true} />
                
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
                  <div className="space-y-2 p-3">
                    {chats?.map((chat: Chat) => {
                      const unreadCount = unreadCounts?.[chat._id] || 0;
                      const hasUnread = unreadCount > 0;
                      
                      return (
                        <div
                          key={chat._id}
                          onClick={() => handleSelectChat(chat._id)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors border relative ${
                            selectedChatId === chat._id 
                              ? 'bg-black text-white border-black' 
                              : hasUnread
                              ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 shadow-sm'
                              : 'bg-white hover:bg-gray-100 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              {(() => {
                                const { avatarUrl, userName } = getChatAvatar(chat.participants);
                                
                                return avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={userName}
                                    className="w-12 h-12 rounded-full border border-gray-200"
                                  />
                                ) : (
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    selectedChatId === chat._id 
                                      ? 'bg-white text-black' 
                                      : 'bg-gray-300 text-gray-600'
                                  }`}>
                                    <span className="text-sm font-medium">
                                      {userName.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                            
                            {/* Chat info */}
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium mb-1 text-sm flex items-center justify-between ${
                                selectedChatId === chat._id 
                                  ? 'text-white' 
                                  : hasUnread 
                                  ? 'text-blue-900' 
                                  : 'text-black'
                              }`}>
                                <span className="truncate">
                                  {chat.participants
                                    .filter(p => p !== user?.id)
                                    .map(p => getUserName(p))
                                    .join(', ') || 'Personal Chat'}
                                </span>
                                {hasUnread && (
                                  <div className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                    selectedChatId === chat._id 
                                      ? 'bg-white text-black' 
                                      : 'bg-blue-600 text-white'
                                  }`}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                  </div>
                                )}
                              </div>
                              <div className={`text-xs truncate mb-1 ${
                                selectedChatId === chat._id 
                                  ? 'text-gray-300' 
                                  : hasUnread 
                                  ? 'text-blue-700' 
                                  : 'text-gray-600'
                              }`}>
                                {chat.lastMessage.body}
                              </div>
                              <div className={`text-xs ${
                                selectedChatId === chat._id 
                                  ? 'text-gray-400' 
                                  : hasUnread 
                                  ? 'text-blue-600' 
                                  : 'text-gray-500'
                              }`}>
                                {new Date(chat.updatedAt).toLocaleDateString()} at {new Date(chat.updatedAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Desktop Chat View */}
        <SidebarInset className="hidden md:flex flex-1 w-full max-w-none">
          <div className="flex-1 flex flex-col min-w-0 w-full h-full max-w-none">
            {selectedChatId && selectedChat ? (
              <>
                <div className="bg-white border-b border-gray-300 px-4 sm:px-6 py-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      {(() => {
                        const { avatarUrl, userName } = getChatAvatar(selectedChat.participants);
                        
                        return avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={userName}
                            className="w-10 h-10 rounded-full border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        );
                      })()}
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
                    </div>
                    <InviteButton chatId={selectedChatId} />
                  </div>
                </div>

                <div className="flex-1 bg-gray-50 min-h-0 flex flex-col w-full">
                  <ChatMessages chatId={selectedChatId} />
                </div>

                <div className="bg-white border-t border-gray-300 p-3 sm:p-4 flex-shrink-0 w-full">
                  <div className="flex items-end space-x-2 sm:space-x-3 w-full">
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
              <div className="flex-1 flex items-center justify-center bg-gray-50 w-full">
                <div className="text-center max-w-md w-full px-6">
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
        </SidebarInset>
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

export default function ChatPage() {
  return <ChatPageContent />;
}