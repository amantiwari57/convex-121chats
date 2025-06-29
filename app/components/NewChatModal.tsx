import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { UserSelector } from "./UserSelector";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onChatCreated: (chatId: Id<"chat">) => void;
}

export function NewChatModal({ isOpen, onClose, currentUserId, onChatCreated }: NewChatModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const createChatWithParticipants = useMutation(api.chats.createChatWithParticipants);

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user to chat with.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const chatId = await createChatWithParticipants({
        createdBy: currentUserId as Id<"users">,
        participantIds: selectedUsers,
        initialMessage: "Chat started",
      });
      
      onChatCreated(chatId);
      onClose();
      setSelectedUsers([]);
    } catch (err: any) {
      setError(err.message || "Failed to create chat");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Create New Chat</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <UserSelector 
          onSelectUsers={setSelectedUsers} 
          currentUserId={currentUserId}
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateChat}
            disabled={loading || selectedUsers.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Chat"}
          </button>
        </div>
      </div>
    </div>
  );
} 