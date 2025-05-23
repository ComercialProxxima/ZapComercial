import { useEffect, useState, useRef, useMemo } from "react";
import { ChatMessage, ChatContact } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface User {
  username: string;
  userId: number;
}

export function useChat(user: User) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [allMessages, setAllMessages] = useState<Record<number, ChatMessage[]>>({
    0: [] // Chat público inicia com um array vazio
  });
  const [contacts, setContacts] = useState<ChatContact[]>([
    { id: 0, username: 'Chat Público', connected: true }
  ]);
  const [activeChatId, setActiveChatId] = useState<number>(0); // 0 = chat público
  const [connected, setConnected] = useState<boolean>(false);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Mensagens do chat ativo
  const messages = useMemo(() => {
    return allMessages[activeChatId] || [];
  }, [allMessages, activeChatId]);

  // Número de usuários online (excluindo o chat público)
  const onlineUsers = useMemo(() => {
    return contacts.filter(c => c.id !== 0).length;
  }, [contacts]);

  // Conectar ao WebSocket
  useEffect(() => {
    // Tentativa de conectar ao servidor WebSocket
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const newSocket = new WebSocket(wsUrl);
        
        newSocket.onopen = () => {
          setConnected(true);
          console.log("WebSocket connected");
          
          // Enviar mensagem de login se estivermos reconectando
          newSocket.send(JSON.stringify({
            type: 'login',
            username: user.username
          }));
          
          // Solicitar lista de usuários
          setTimeout(() => {
            if (newSocket.readyState === WebSocket.OPEN) {
              console.log("Solicitando lista de usuários...");
              newSocket.send(JSON.stringify({
                type: 'getUsers'
              }));
            }
          }, 1000);
          
          // Configurar um intervalo para solicitar a lista periodicamente
          const usersInterval = setInterval(() => {
            if (newSocket.readyState === WebSocket.OPEN) {
              console.log("Atualizando lista de usuários...");
              newSocket.send(JSON.stringify({
                type: 'getUsers'
              }));
            }
          }, 5000);
          
          // Limpar qualquer timeout de reconexão
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };
        
        newSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'message': {
              // Adicionar nova mensagem ao estado
              const chatId = data.chatId !== undefined ? data.chatId : 0;
              
              setAllMessages(prev => {
                // Certificar-se de que o array existe para este chatId
                const existingMessages = prev[chatId] || [];
                
                // Criar um novo objeto com o chatId atualizado
                return {
                  ...prev,
                  [chatId]: [...existingMessages, data.data]
                };
              });
              
              // Rolar para o final se for o chat ativo
              if (chatId === activeChatId) {
                setTimeout(() => {
                  const container = document.getElementById('messages-container');
                  if (container) {
                    container.scrollTop = container.scrollHeight;
                  }
                }, 100);
              }
              break;
            }
            
            case 'usersList': {
              // Atualizar lista de contatos
              console.log("Recebendo lista de usuários:", data.users);
              
              // Deduplica usuários pelo nome (mantendo o primeiro encontrado)
              const uniqueUsersByName = new Map<string, ChatContact>();
              
              // Primeiro garantimos que o Chat Público esteja incluído
              const publicChat = data.users.find((u: ChatContact) => u.id === 0);
              if (publicChat) {
                uniqueUsersByName.set(publicChat.username, publicChat);
              }
              
              // Adicionar outros usuários, evitando duplicação por nome
              data.users.forEach((contact: ChatContact) => {
                if (contact.id !== 0 && !uniqueUsersByName.has(contact.username)) {
                  uniqueUsersByName.set(contact.username, contact);
                }
              });
              
              // Converter Map de volta para array
              const uniqueContacts = Array.from(uniqueUsersByName.values());
              setContacts(uniqueContacts || []);
              break;
            }
            
            case 'error':
              toast({
                title: "Erro",
                description: data.message,
                variant: "destructive",
              });
              break;
          }
        };
        
        newSocket.onclose = () => {
          setConnected(false);
          console.log("WebSocket disconnected");
          
          // Agendar reconexão
          reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log("Attempting to reconnect...");
            connectWebSocket();
          }, 3000);
        };
        
        newSocket.onerror = (error) => {
          console.error("WebSocket error:", error);
          newSocket.close();
        };
        
        setSocket(newSocket);
        
        // Função de limpeza para fechar o socket quando o componente é desmontado
        return () => {
          newSocket.close();
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }
        };
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        setConnected(false);
        
        // Agendar reconexão
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWebSocket();
        }, 3000);
      }
    };
    
    connectWebSocket();
  }, [user.username, toast]);

  // Função para enviar uma mensagem
  const sendMessage = (text: string) => {
    if (socket && socket.readyState === WebSocket.OPEN && text.trim()) {
      socket.send(JSON.stringify({
        type: 'message',
        text,
        receiverId: activeChatId // 0 para chat público, ID do usuário para chat privado
      }));
    } else if (!connected) {
      toast({
        title: "Não conectado",
        description: "Você está desconectado. Reconectando...",
        variant: "destructive",
      });
    }
  };

  // Função para mudar de chat
  const switchChat = (chatId: number) => {
    setActiveChatId(chatId);
    
    // Inicializar o array de mensagens se ainda não existir
    setAllMessages(prev => {
      if (!prev[chatId]) {
        return { ...prev, [chatId]: [] };
      }
      return prev;
    });
  };

  return {
    messages,
    contacts,
    onlineUsers,
    connected,
    activeChatId,
    sendMessage,
    switchChat
  };
}
