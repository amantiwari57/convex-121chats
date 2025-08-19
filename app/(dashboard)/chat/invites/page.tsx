'use client';

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Check, 
  X, 
  Users, 
  Clock, 
  MessageCircle, 
  User, 
  Calendar,
  ArrowLeft,
  Mail,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

export default function InviteRequestsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [processingInvites, setProcessingInvites] = useState<Set<string>>(new Set());
  
  const pendingInvites = useQuery(api.chats.getPendingInvites, 
    user?.id ? { userId: user.id } : "skip"
  );
  const respondToInvite = useMutation(api.chats.respondToInvite);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleResponse = async (chatId: Id<"chat">, accept: boolean, inviteId: string) => {
    if (!user?.id) return;

    setProcessingInvites(prev => new Set(prev.add(inviteId)));
    try {
      await respondToInvite({
        chatId: chatId,
        invitedUser: user.id,
        accept,
      });
      
      // If accepted, navigate to the chat
      if (accept) {
        router.push(`/chat`);
      }
    } catch (err) {
      console.error('Failed to respond to invitation:', err);
    } finally {
      setProcessingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(inviteId);
        return newSet;
      });
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
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-black">Invite Requests</h1>
              <p className="text-sm text-gray-600">
                {pendingInvites?.length || 0} pending invitation{(pendingInvites?.length || 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {!pendingInvites || pendingInvites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending invitations</h3>
            <p className="text-gray-600 mb-6">
              You don&apos;t have any pending chat invitations at the moment.
            </p>
            <button
              onClick={() => router.push('/chat')}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Chats
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingInvites.map((invite) => {
              const isProcessing = processingInvites.has(invite._id);
              
              return (
                <div key={invite._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-orange-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-orange-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Chat Invitation from {invite.inviter.name || invite.inviter.email || "Unknown User"}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          You&apos;ve been invited to join a conversation
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Invited {formatTimeAgo(invite.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{invite.participants?.length || 0} members</span>
                          </div>
                          {invite.recentMessagesCount > 0 && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <MessageCircle className="w-4 h-4" />
                              <span>{invite.recentMessagesCount} recent messages</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Chat Members */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Chat Members</h4>
                        <div className="space-y-2">
                          {invite.participants?.slice(0, 6).map((participant) => (
                            <div key={participant.clerkId} className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {(participant.name || participant.email || "U").charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {participant.name || "Unknown User"}
                                </p>
                                <p className="text-xs text-gray-500">{participant.email}</p>
                              </div>
                              {participant.clerkId === invite.invitedBy && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                  Inviter
                                </span>
                              )}
                            </div>
                          ))}
                          {invite.participants && invite.participants.length > 6 && (
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-xs">+{invite.participants.length - 6}</span>
                              </div>
                              <span>and {invite.participants.length - 6} more members</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Chat Preview */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                        {invite.chat?.lastMessage ? (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-2">Latest message:</p>
                            <p className="text-sm text-gray-800 mb-2">
                              &quot;{invite.chat.lastMessage.body}&quot;
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTimeAgo(invite.chat.updatedAt)}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">No messages yet</p>
                            <p className="text-xs text-gray-500">Be the first to start the conversation!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => handleResponse(invite.chatId, true, invite._id)}
                        disabled={isProcessing}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Accept & Join Chat
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleResponse(invite.chatId, false, invite._id)}
                        disabled={isProcessing}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5" />
                            Decline Invitation
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
