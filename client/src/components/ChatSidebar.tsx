import { useState, useMemo } from "react";
import { Search, Plus, Users, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChatContact } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

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

  // Separar os contatos em grupos
  const groupedContacts = useMemo(() => {
    // Chat público sempre em primeiro
    const publicChat = filteredContacts.find(c => c.id === 0);
    
    // Todos os usuários (exceto chat público)
    const userContacts = filteredContacts.filter(c => c.id !== 0 && c.id !== currentUserId)
      .sort((a, b) => {
        // Usuários conectados primeiro
        if (a.connected !== b.connected) {
          return a.connected ? -1 : 1;
        }
        // Depois ordenar por nome
        return a.username.localeCompare(b.username);
      });
    
    // O usuário atual (você)
    const currentUser = filteredContacts.find(c => c.id === currentUserId);
    
    return {
      publicChat,
      userContacts,
      currentUser
    };
  }, [filteredContacts, currentUserId]);

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
          <div className="ml-3 text-white">
            <p className="text-sm font-medium truncate">
              {groupedContacts.currentUser?.username || "Usuário"}
            </p>
            <p className="text-xs opacity-80">Online</p>
          </div>
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
            placeholder="Pesquisar usuários"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted rounded-full text-sm"
          />
        </div>
      </div>
      
      {/* Chat público */}
      {groupedContacts.publicChat && (
        <div className="border-b border-gray-200">
          <div 
            key={groupedContacts.publicChat.id}
            onClick={() => onSelectChat(groupedContacts.publicChat!.id)}
            className={cn(
              "flex items-center p-3 cursor-pointer hover:bg-sidebar-active",
              currentChat === groupedContacts.publicChat.id && "bg-sidebar-active"
            )}
          >
            <Avatar className="h-12 w-12 mr-3">
              <AvatarFallback className="text-white bg-secondary">
                <MessageCircle size={20} />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium text-base text-gray-900 truncate">
                  {groupedContacts.publicChat.username}
                </h3>
              </div>
              <div className="flex items-center">
                <p className="text-xs text-gray-500">
                  Chat para todos os usuários conectados
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Cabeçalho da lista de usuários online */}
      <div className="p-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <Users size={16} className="text-primary mr-2" />
          <h2 className="text-sm font-medium text-gray-700">Usuários online</h2>
          <Badge variant="outline" className="ml-2 bg-white">
            {groupedContacts.userContacts.filter(c => c.connected).length}
          </Badge>
        </div>
      </div>
      
      {/* Lista de usuários */}
      <div className="flex-1 overflow-y-auto">
        {groupedContacts.userContacts.map((contact) => (
          <div 
            key={contact.id}
            onClick={() => onSelectChat(contact.id)}
            className={cn(
              "flex items-center p-3 cursor-pointer hover:bg-sidebar-active border-b border-gray-100",
              currentChat === contact.id && "bg-sidebar-active"
            )}
          >
            <Avatar className="h-12 w-12 mr-3">
              <AvatarFallback className="text-white bg-primary">
                {contact.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium text-sm text-gray-900 truncate">
                  {contact.username}
                </h3>
              </div>
              <div className="flex items-center">
                {contact.connected ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    <p className="text-xs text-green-600 font-medium">
                      Online
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-500">
                    Offline
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Mensagem quando não há usuários */}
        {groupedContacts.userContacts.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <p>Nenhum outro usuário conectado</p>
            <p className="text-xs mt-1">Aguarde até que alguém entre no chat</p>
          </div>
        )}
      </div>
    </div>
  );
}