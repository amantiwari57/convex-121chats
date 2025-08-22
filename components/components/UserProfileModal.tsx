'use client';

import { UserProfile, useUser } from "@clerk/nextjs";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user } = useUser();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {user?.imageUrl && (
              <img
                src={user.imageUrl}
                alt={user.fullName || "Profile"}
                className="w-8 h-8 rounded-full"
              />
            )}
            <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <UserProfile 
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "border-0 shadow-none",
                navbar: "hidden",
                pageScrollBox: "p-0"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
