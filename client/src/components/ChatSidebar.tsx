import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChatContact } from "@shared/schema";

interface ChatSidebarProps {
  currentUserId: number;
  currentChat: number;
  contacts: ChatContact[];
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
  onLogout: () => void;
}

export default function ChatSidebar({ 
  currentUserId, 
  currentChat, 
  contacts,
  onSelectChat, 
  onNewChat,
  onLogout 
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filtrar contatos com base na busca
  const filteredContacts = contacts.filter(contact => 
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Função para formatar a data atual para exibição (apenas para demonstração)
  const formatCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-sidebar-bg border-r">
      {/* Header da barra lateral */}
      <div className="bg-secondary p-3 flex justify-between items-center">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 bg-secondary-foreground text-white cursor-pointer" onClick={onLogout}>
            <AvatarFallback>
              {currentUserId.toString().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <Button variant="ghost" size="icon" onClick={onNewChat} className="text-white hover:bg-secondary/80">
          <Plus size={20} />
        </Button>
      </div>
      
      {/* Barra de pesquisa */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar ou começar uma nova conversa"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted rounded-full text-sm"
          />
        </div>
      </div>
      
      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <div 
            key={contact.id}
            onClick={() => onSelectChat(contact.id)}
            className={cn(
              "flex items-center p-3 cursor-pointer hover:bg-sidebar-active border-b border-gray-100",
              currentChat === contact.id && "bg-sidebar-active"
            )}
          >
            <Avatar className="h-12 w-12 mr-3">
              <AvatarFallback className={cn(
                "text-white",
                contact.id === 0 ? "bg-secondary" : "bg-primary" 
              )}>
                {contact.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium text-sm text-gray-900 truncate">
                  {contact.username}
                  {contact.id === currentUserId && " (Você)"}
                </h3>
                <span className="text-xs text-gray-500">{formatCurrentTime()}</span>
              </div>
              <div className="flex items-center">
                {contact.connected && (
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                )}
                <p className="text-xs text-gray-500">
                  {contact.id === 0 
                    ? "Chat público para todos os usuários" 
                    : contact.connected 
                      ? "Online"
                      : "Offline"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}