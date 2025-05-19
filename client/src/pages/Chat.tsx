import { useEffect, useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import Message from "@/components/Message";
import MessageForm from "@/components/MessageForm";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

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
  
  useEffect(() => {
    if (!connected) {
      toast({
        title: "Desconectado",
        description: "Você foi desconectado do servidor. Tentando reconectar...",
        variant: "destructive",
      });
    }
  }, [connected, toast]);

  return (
    <div className="bg-chat-bg font-sans h-screen flex flex-col">
      <ChatHeader 
        username={user.username} 
        onlineCount={onlineUsers} 
        onLogout={onLogout}
      />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3" id="messages-container">
        {/* Welcome message */}
        <div className="flex justify-center my-4">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-xs text-gray-500 text-center">
            Bem-vindo ao chat, mensagens são visíveis para todos
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
  );
}
