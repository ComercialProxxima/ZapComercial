import { ChatMessage } from "@shared/schema";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

export default function Message({ message, isCurrentUser }: MessageProps) {
  // Format timestamp to local time
  const formatTime = (isoTime: string) => {
    try {
      return new Date(isoTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (e) {
      return ""; // Return empty string if invalid time
    }
  };

  const formattedTime = message.timestamp ? formatTime(message.timestamp) : "";

  return (
    <div className={cn(
      "message-row flex",
      isCurrentUser ? "justify-end" : "",
      message.isSystem ? "justify-center" : ""
    )}>
      {message.isSystem ? (
        <div className="max-w-[80%] bg-white rounded-lg px-4 py-2 shadow-sm">
          <div className="text-xs text-gray-600 italic">
            {message.text}
          </div>
        </div>
      ) : (
        <div className={cn(
          "max-w-[80%] rounded-lg px-3 py-2 shadow-sm",
          isCurrentUser ? "bg-chat-sent" : "bg-chat-received"
        )}>
          {!isCurrentUser && (
            <div className="font-medium text-xs text-whatsapp-green">
              {message.username}
            </div>
          )}
          <div className="text-gray-800 break-words">
            {message.text}
          </div>
          <div className="text-right text-xs text-gray-500">
            {formattedTime}
          </div>
        </div>
      )}
    </div>
  );
}
