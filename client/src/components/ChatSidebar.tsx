import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatContact {
  id: number;
  name: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: number;
}

interface ChatSidebarProps {
  currentUserId: number;
  currentChat?: number;
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
  onLogout: () => void;
}

export default function ChatSidebar({ 
  currentUserId, 
  currentChat, 
  onSelectChat, 
  onNewChat,
  onLogout 
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data para demonstração - em uma aplicação real, isso viria da API
  const mockContacts: ChatContact[] = [
    { 
      id: 0, // Chat público
      name: "Chat Público", 
      lastMessage: "Mensagens do chat público", 
      timestamp: "10:13" 
    },
    { 
      id: 1, 
      name: "+55 18 9122-8455", 
      lastMessage: "Tudo bem entendi, grata.", 
      timestamp: "10:13" 
    },
    { 
      id: 2, 
      name: "+55 41 8192-8255", 
      lastMessage: "Olá estou no site preciso de ajuda", 
      timestamp: "10:13" 
    },
    { 
      id: 3, 
      name: "+55 87 9182-8957", 
      lastMessage: "Qual o prazo de entrega?", 
      timestamp: "10:13" 
    },
    { 
      id: 4, 
      name: "+55 11 9187-9875", 
      lastMessage: "Gostaria de saber sobre meu pedido", 
      timestamp: "10:13" 
    },
  ];
  
  // Filtrar contatos com base na busca
  const filteredContacts = mockContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.lastMessage && contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-sidebar-bg border-r">
      {/* Header da barra lateral */}
      <div className="bg-secondary p-3 flex justify-between items-center">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 bg-secondary-foreground text-white cursor-pointer" onClick={onLogout}>
            <AvatarFallback>
              {currentUserId.toString()[0]}
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
              <AvatarFallback className="bg-primary text-white">
                {contact.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium text-sm text-gray-900 truncate">{contact.name}</h3>
                <span className="text-xs text-gray-500">{contact.timestamp}</span>
              </div>
              {contact.lastMessage && (
                <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}