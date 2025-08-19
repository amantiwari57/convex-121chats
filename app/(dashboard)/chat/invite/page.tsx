'use client';

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";
import { Users, Send, ArrowLeft, Check, Copy } from "lucide-react";

function InvitePageInner() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId') as Id<"chat"> | null;
  
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState("Join our chat conversation!");
  const [isInviting, setIsInviting] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const chat = useQuery(api.chats.getChat, chatId ? { chatId } : "skip");
  const allUsers = useQuery(api.chats.getAllUsers, {});
  const inviteToChat = useMutation(api.chats.inviteToChat);

  // Filter out users who are already participants
  const availableUsers = allUsers?.filter(user => 
    !chat?.participants.includes(user.clerkId)
  ) || [];

  useEffect(() => {
    if (!chatId) {
      router.push('/chat');
    }
  }, [chatId, router]);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendInvites = async () => {
    if (!user?.id || !chatId || selectedUsers.length === 0) return;

    setIsInviting(true);
    try {
      const invitePromises = selectedUsers.map(userId =>
        inviteToChat({
          chatId,
          invitedUser: userId,
          invitedBy: user.id,
        })
      );

      await Promise.all(invitePromises);
      setInvitedUsers([...invitedUsers, ...selectedUsers]);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to send invites:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const generateInviteLink = () => {
    if (!chatId) return '';
    return `${window.location.origin}/chat?join=${chatId}`;
  };

  const copyInviteLink = async () => {
    const link = generateInviteLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-black mb-2">Chat not found</h2>
          <p className="text-gray-600 mb-4">The chat you&apos;re trying to invite users to doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/chat')}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/chat')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-black">Invite to Chat</h1>
              <p className="text-sm text-gray-600">
                Add people to your conversation
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Invite Link Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-black mb-4">Share Invite Link</h2>
          <p className="text-sm text-gray-600 mb-4">
            Anyone with this link can join the conversation
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={generateInviteLink()}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <button
              onClick={copyInviteLink}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              {copiedToClipboard ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Direct Invite Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Send Direct Invites</h2>
          
          {availableUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">All users are already in this chat</p>
            </div>
          ) : (
            <>
              {/* User Selection */}
              <div className="space-y-3 mb-6">
                {availableUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserToggle(user.clerkId)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedUsers.includes(user.clerkId)
                        ? 'border-blue-500 bg-blue-50'
                        : invitedUsers.includes(user.clerkId)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      {invitedUsers.includes(user.clerkId) ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">Invited</span>
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          selectedUsers.includes(user.clerkId)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedUsers.includes(user.clerkId) && (
                            <Check className="w-3 h-3 text-white m-0.5" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Add a personal message to your invitation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendInvites}
                disabled={selectedUsers.length === 0 || isInviting}
                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isInviting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Sending Invites...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send {selectedUsers.length} Invite{selectedUsers.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Success Message */}
        {invitedUsers.length > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <Check className="w-5 h-5" />
              <p className="font-medium">
                Successfully sent {invitedUsers.length} invitation{invitedUsers.length !== 1 ? 's' : ''}!
              </p>
            </div>
            <p className="text-sm text-green-700 mt-1">
              The invited users will receive notifications and can join the conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <InvitePageInner />
    </Suspense>
  );
}
