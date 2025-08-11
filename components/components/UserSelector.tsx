import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CheckCheck } from 'lucide-react';
// User interface is inferred from server types via useQuery; explicit local type unused and removed

interface UserSelectorProps {
  onSelectUsers: (userIds: string[]) => void; // Clerk user IDs
  currentUserId: string;
}

export function UserSelector({ onSelectUsers, currentUserId }: UserSelectorProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]); // Clerk user IDs
  const users = useQuery(api.chats.getAllUsers, {});

  // Use useEffect to notify parent of selection changes
  useEffect(() => {
    onSelectUsers(selectedUsers);
  }, [selectedUsers, onSelectUsers]);

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSelection = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      
      return newSelection;
    });
  };

  if (!users) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
      </div>
    );
  }

  // Filter out current user
  const availableUsers = users.filter(user => user.clerkId !== currentUserId);

  if (availableUsers.length === 0) {
    return (
      <div className="p-4 text-gray-600 text-center">
        No other users available to chat with.
      </div>
    );
  }

  return (
    <div className="max-h-60 overflow-y-auto">
      <h3 className="text-sm font-semibold text-black mb-3">Select people to invite:</h3>
      <div className="space-y-2">
        {availableUsers.map((user) => (
          <label
            key={user._id}
            className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200 transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedUsers.includes(user.clerkId)}
              onChange={() => toggleUser(user.clerkId)}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-black">{user.name}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-600 font-medium">
        {selectedUsers.length} person{selectedUsers.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
} 