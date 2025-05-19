import { Button } from "@/components/ui/button";
import { MoreVertical, Search, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatHeaderProps {
  username: string;
  onlineCount: number;
  onLogout: () => void;
  chatName?: string;
}

export default function ChatHeader({ username, onlineCount, onLogout, chatName = "Chat Público" }: ChatHeaderProps) {
  return (
    <header className="bg-secondary text-white py-3 px-4 shadow-md flex items-center justify-between">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarFallback className="bg-secondary-foreground">
            {chatName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-semibold">{chatName}</h1>
          {chatName === "Chat Público" && (
            <div className="flex items-center text-xs text-white/80">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
              <span>{onlineCount} {onlineCount === 1 ? 'usuário online' : 'usuários online'}</span>
            </div>
          )}
          {chatName !== "Chat Público" && (
            <div className="flex items-center text-xs text-white/80">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
              <span>Online</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost"
          size="icon"
          className="text-white hover:bg-secondary/80"
          aria-label="Chamada de vídeo"
          title="Chamada de vídeo"
        >
          <Video size={18} />
        </Button>
        
        <Button 
          variant="ghost"
          size="icon"
          className="text-white hover:bg-secondary/80"
          aria-label="Chamada de voz"
          title="Chamada de voz"
        >
          <Phone size={18} />
        </Button>
        
        <Button 
          variant="ghost"
          size="icon"
          className="text-white hover:bg-secondary/80"
          aria-label="Pesquisar na conversa"
          title="Pesquisar na conversa"
        >
          <Search size={18} />
        </Button>
        
        <Button 
          variant="ghost"
          size="icon"
          onClick={onLogout}
          className="text-white hover:bg-secondary/80"
          aria-label="Mais opções"
          title="Mais opções"
        >
          <MoreVertical size={18} />
        </Button>
      </div>
    </header>
  );
}
