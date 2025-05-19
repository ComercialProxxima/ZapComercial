import { useEffect, useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatSidebar from "@/components/ChatSidebar";
import Message from "@/components/Message";
import MessageForm from "@/components/MessageForm";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatProps {
  user: {
    username: string;
    userId: number;
  };
  onLogout: () => void;
}

export default function Chat({ user, onLogout }: ChatProps) {
  const { messages, onlineUsers, sendMessage, connected } = useChat(user);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [activeChatId, setActiveChatId] = useState(0); // 0 = chat público
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  useEffect(() => {
    if (!connected) {
      toast({
        title: "Desconectado",
        description: "Você foi desconectado do servidor. Tentando reconectar...",
        variant: "destructive",
      });
    }
  }, [connected, toast]);

  // Ajustar o sidebar quando o tamanho da tela muda
  useEffect(() => {
    setShowSidebar(!isMobile || showMobileSidebar);
  }, [isMobile, showMobileSidebar]);

  const handleSelectChat = (chatId: number) => {
    setActiveChatId(chatId);
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  };

  const handleNewChat = () => {
    toast({
      title: "Função não disponível",
      description: "Esta funcionalidade não está disponível na versão atual.",
    });
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    }
  };

  return (
    <div className="bg-chat-bg font-sans h-screen flex overflow-hidden">
      {/* Sidebar (contatos) */}
      {showSidebar && (
        <div className={`${isMobile ? 'absolute z-10 h-full' : 'relative'} w-80 ${showMobileSidebar ? 'block' : isMobile ? 'hidden' : 'block'}`}>
          <ChatSidebar 
            currentUserId={user.userId}
            currentChat={activeChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onLogout={onLogout}
          />
        </div>
      )}
      
      {/* Chat principal */}
      <div className="flex-1 flex flex-col">
        <ChatHeader 
          username={user.username} 
          onlineCount={onlineUsers} 
          onLogout={onLogout}
          chatName={activeChatId === 0 ? "Chat Público" : `Chat ${activeChatId}`}
        />
        
        {/* Background pattern like WhatsApp */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-chat-bg" id="messages-container"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        >
          {/* Welcome message */}
          <div className="flex justify-center my-4">
            <div className="bg-white/90 rounded-lg px-4 py-2 shadow-sm text-xs text-gray-500 text-center">
              <p>Bem-vindo ao chat, mensagens são visíveis para todos</p>
              <p className="mt-1">Este chat está criptografado ponta-a-ponta</p>
            </div>
          </div>
          
          {/* Message list */}
          {messages.map((message, index) => (
            <Message 
              key={index}
              message={message}
              isCurrentUser={message.username === user.username && !message.isSystem}
            />
          ))}
        </div>
        
        <MessageForm onSendMessage={sendMessage} disabled={!connected} />
      </div>
    </div>
  );
}
