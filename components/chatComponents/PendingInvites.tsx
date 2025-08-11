import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Id } from '../../convex/_generated/dataModel';

export function PendingInvites() {
  const { user } = useUser();
  const pendingInvites = useQuery(api.chats.getPendingInvites, 
    user?.id ? { userId: user.id as Id<"users"> } : "skip"
  );
  const respondToInvite = useMutation(api.chats.respondToInvite);
  const users = useQuery(api.chats.getAllUsers, {});

  if (!pendingInvites?.length) {
    return null;
  }

  const handleResponse = async (chatId: Id<"chat">, accept: boolean) => {
    if (!user?.id) return;

    try {
      await respondToInvite({
        chatId,
        invitedUser: user.id as Id<"users">,
        accept,
      });
    } catch (err) {
      console.error('Failed to respond to invitation:', err);
    }
  };

  const getUserName = (userId: string) => {
    const user = users?.find(u => u.clerkId === userId);
    return user?.name || user?.email || "Unknown User";
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">Pending Invitations</h3>
      <div className="space-y-3">
        {pendingInvites.map((invite) => (
          <div key={invite._id} className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium text-gray-900">
                {getUserName(invite.invitedBy)}
              </span>
              {' '}invited you to join a chat
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleResponse(invite.chatId, true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => handleResponse(invite.chatId, false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 