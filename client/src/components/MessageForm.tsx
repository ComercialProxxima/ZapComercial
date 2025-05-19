import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Send } from "lucide-react";

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
    <div className="bg-white border-t border-gray-200 p-3">
      <form onSubmit={handleSubmit} className="flex items-center">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite uma mensagem"
          disabled={disabled}
          className="flex-1 py-2 px-4 bg-chat-bg rounded-full focus:outline-none"
        />
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className="ml-2 bg-whatsapp-green text-white rounded-full p-2 hover:bg-whatsapp-teal transition duration-200 h-10 w-10 flex items-center justify-center"
          aria-label="Enviar mensagem"
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
}
