'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Id } from '../../../convex/_generated/dataModel';
import { ArrowLeft, Users, UserPlus } from 'lucide-react';

export default function InvitePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId') as Id<"chat">;
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const inviteToChat = useMutation(api.chats.inviteToChat);
  const users = useQuery(api.chats.getAllUsers, {});
  const chat = useQuery(api.chats.getChat, chatId ? { chatId } : "skip");

  useEffect(() => {
    if (!chatId) {
      router.push('/chat');
    }
  }, [chatId, router]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedUserId || !user?.id || !chatId) {
      setError('Please select a user to invite');
      return;
    }

    try {
      await inviteToChat({
        chatId,
        invitedUser: selectedUserId as Id<"users">,
        invitedBy: user.id as Id<"users">,
      });
      setSuccess('Invitation sent successfully!');
      setSelectedUserId('');
      setTimeout(() => {
        router.push('/chat');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };

  // Filter out current user and already invited users
  const availableUsers = users?.filter(u => 
    u.clerkId !== user?.id && 
    !chat?.participants.includes(u.clerkId)
  ) || [];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/signin");
    return null;
  }

  if (!chatId || !chat) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg font-semibold text-black mb-2">Chat not found</div>
          <button
            onClick={() => router.push('/chat')}
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/chat')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Invite People</h1>
              <p className="text-sm text-gray-600">
                Invite people to join your conversation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Invite to Chat</h2>
              <p className="text-sm text-gray-600">
                Select people you&apos;d like to invite to this conversation
              </p>
            </div>
          </div>

          <form onSubmit={handleInvite} className="space-y-6">
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
                Select User to Invite
              </label>
              <select
                id="user"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a user to invite...</option>
                {availableUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              {availableUsers.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  All available users are already in this chat.
                </p>
              )}
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/chat')}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedUserId || availableUsers.length === 0}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                Send Invite
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
