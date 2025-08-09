import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// User interface is inferred from server types via useQuery; explicit local type unused and removed

interface UserSelectorProps {
  onSelectUsers: (userIds: Id<"users">[]) => void;
  currentUserId: string;
}

export function UserSelector({ onSelectUsers, currentUserId }: UserSelectorProps) {
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const users = useQuery(api.chats.getAllUsers, {});

  // Use useEffect to notify parent of selection changes
  useEffect(() => {
    onSelectUsers(selectedUsers);
  }, [selectedUsers, onSelectUsers]);

  const toggleUser = (userId: Id<"users">) => {
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
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Filter out current user
  const availableUsers = users.filter(user => user._id !== currentUserId);

  if (availableUsers.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No other users available to chat with.
      </div>
    );
  }

  return (
    <div className="max-h-60 overflow-y-auto">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Select users to invite:</h3>
      <div className="space-y-2">
        {availableUsers.map((user) => (
          <label
            key={user._id}
            className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedUsers.includes(user._id)}
              onChange={() => toggleUser(user._id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500">
        {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
} 