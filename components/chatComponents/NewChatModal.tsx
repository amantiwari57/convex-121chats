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
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]); // Clerk user IDs
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
        createdBy: currentUserId,
        participantIds: selectedUsers,
        initialMessage: "Chat started",
      });
      
      onChatCreated(chatId);
      onClose();
      setSelectedUsers([]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create chat";
      setError(message);
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
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Start New Conversation</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-black transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg">
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
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateChat}
            disabled={loading || selectedUsers.length === 0}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Creating..." : "Start Conversation"}
          </button>
        </div>
      </div>
    </div>
  );
} 