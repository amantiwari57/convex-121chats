import { useRouter } from 'next/navigation';
import { Id } from '../../convex/_generated/dataModel';
import { UserPlus } from 'lucide-react';

export function InviteButton({ chatId }: { chatId: Id<"chat"> }) {
  const router = useRouter();

  const handleInviteClick = () => {
    router.push(`/chat/invite?chatId=${chatId}`);
  };

  return (
    <button
      onClick={handleInviteClick}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
    >
      <UserPlus className="h-5 w-5" />
      Invite
    </button>
  );
} 