import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Id } from '../../convex/_generated/dataModel';
import { Bell, Check, X, Users, Clock, MessageCircle, User, Calendar } from 'lucide-react';

interface PendingInvitesProps {
  showInSidebar?: boolean;
  showDetailed?: boolean;
}

export function PendingInvites({ showInSidebar = false, showDetailed = false }: PendingInvitesProps) {
  const { user } = useUser();
  const pendingInvites = useQuery(api.chats.getPendingInvites, 
    user?.id ? { userId: user.id } : "skip"
  );
  const respondToInvite = useMutation(api.chats.respondToInvite);

  if (!pendingInvites?.length) {
    return null;
  }

  const handleResponse = async (chatId: Id<"chat">, accept: boolean) => {
    if (!user?.id) return;

    try {
      await respondToInvite({
        chatId,
        invitedUser: user.id,
        accept,
      });
    } catch (err) {
      console.error('Failed to respond to invitation:', err);
    }
  };

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

  if (showInSidebar) {
    return (
      <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-4 h-4 text-orange-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            Pending Invites ({pendingInvites.length})
          </h3>
        </div>
        <div className="space-y-2">
          {pendingInvites.map((invite) => (
            <div key={invite._id} className="bg-white p-3 rounded-md border border-orange-200 shadow-sm">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 font-medium truncate">
                    {invite.inviter.name || invite.inviter.email || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-600">
                    invited you to join
                  </p>
                </div>
              </div>
              
              <div className="mb-2 pl-8">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{invite.participants?.length || 0} members</span>
                  <Clock className="w-3 h-3 ml-1" />
                  <span>{formatTimeAgo(invite.createdAt)}</span>
                </div>
                {invite.recentMessagesCount > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                    <MessageCircle className="w-3 h-3" />
                    <span>{invite.recentMessagesCount} recent messages</span>
                  </div>
                )}
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handleResponse(invite.chatId, true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                  title="Accept invite"
                >
                  <Check className="w-3 h-3" />
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(invite.chatId, false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                  title="Decline invite"
                >
                  <X className="w-3 h-3" />
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-xl p-4 border border-gray-200 z-50">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
          <Bell className="w-4 h-4 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Chat Invitations ({pendingInvites.length})
        </h3>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {pendingInvites.map((invite) => (
          <div key={invite._id} className="bg-white border border-orange-200 rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 border-b border-orange-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-orange-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-semibold">
                    {invite.inviter.name || invite.inviter.email || "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-600">invited you to join their chat</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatTimeAgo(invite.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{invite.participants?.length || 0} members</span>
                    </div>
                    {invite.recentMessagesCount > 0 && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <MessageCircle className="w-3 h-3" />
                        <span>{invite.recentMessagesCount} messages</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Preview */}
            <div className="p-4">
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Chat Members:</p>
                <div className="flex flex-wrap gap-1">
                  {invite.participants?.slice(0, 4).map((participant, index) => (
                    <span
                      key={participant.clerkId}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                    >
                      {participant.name || participant.email || "Unknown"}
                    </span>
                  ))}
                  {invite.participants && invite.participants.length > 4 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-600">
                      +{invite.participants.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Last message preview */}
              {invite.chat?.lastMessage && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Recent message:</p>
                  <p className="text-sm text-gray-800 truncate">
                    "{invite.chat.lastMessage.body}"
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleResponse(invite.chatId, true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Accept Invitation
                </button>
                <button
                  onClick={() => handleResponse(invite.chatId, false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 