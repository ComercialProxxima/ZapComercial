import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface ChatHeaderProps {
  username: string;
  onlineCount: number;
  onLogout: () => void;
}

export default function ChatHeader({ username, onlineCount, onLogout }: ChatHeaderProps) {
  return (
    <header className="bg-whatsapp-teal text-white py-3 px-4 shadow-md flex items-center justify-between">
      <div className="flex items-center">
        <div 
          className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-whatsapp-teal font-semibold mr-3"
          aria-label={`Avatar de ${username}`}
        >
          {username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="font-semibold">Chat Público</h1>
          <div className="flex items-center text-xs">
            <span className="w-2 h-2 bg-whatsapp-light rounded-full mr-1"></span>
            <span>{onlineCount} {onlineCount === 1 ? 'usuário online' : 'usuários online'}</span>
          </div>
        </div>
      </div>
      
      <Button 
        variant="ghost"
        size="icon"
        onClick={onLogout}
        className="text-white hover:bg-whatsapp-teal hover:text-white"
        aria-label="Sair do chat"
        title="Sair do chat"
      >
        <LogOut size={20} />
      </Button>
    </header>
  );
}
