import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Send, Smile, Paperclip } from "lucide-react";

interface MessageFormProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export default function MessageForm({ onSendMessage, disabled = false }: MessageFormProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 py-3 px-4">
      <form onSubmit={handleSubmit} className="flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-primary mr-1"
          aria-label="Emoji"
        >
          <Smile size={22} />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-primary mr-1"
          aria-label="Anexar"
        >
          <Paperclip size={22} />
        </Button>
        
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite uma mensagem"
          disabled={disabled}
          className="flex-1 py-2 px-4 bg-chat-bg rounded-full focus:outline-none focus:ring-1 focus:ring-primary"
        />
        
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className="ml-2 bg-primary text-white rounded-full p-2 hover:bg-primary/90 transition duration-200 h-10 w-10 flex items-center justify-center"
          aria-label="Enviar mensagem"
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
}
