import { useEffect, useState, useRef } from "react";
import { ChatMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface User {
  username: string;
  userId: number;
}

export function useChat(user: User) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number>(1);
  const [connected, setConnected] = useState<boolean>(false);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Connect to WebSocket
  useEffect(() => {
    // Attempt to connect to the WebSocket server
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const newSocket = new WebSocket(wsUrl);
        
        newSocket.onopen = () => {
          setConnected(true);
          console.log("WebSocket connected");
          
          // Send login message if we're reconnecting
          newSocket.send(JSON.stringify({
            type: 'login',
            username: user.username
          }));
          
          // Clear any reconnection timeout
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };
        
        newSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'message':
              // Add new message to state
              setMessages(prev => [...prev, data.data]);
              
              // Scroll to bottom
              setTimeout(() => {
                const container = document.getElementById('messages-container');
                if (container) {
                  container.scrollTop = container.scrollHeight;
                }
              }, 100);
              break;
              
            case 'users':
              // Update online users count
              setOnlineUsers(data.count);
              break;
              
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
          
          // Schedule reconnection
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
        
        // Clean up function to close socket when component unmounts
        return () => {
          newSocket.close();
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }
        };
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        setConnected(false);
        
        // Schedule reconnection
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWebSocket();
        }, 3000);
      }
    };
    
    connectWebSocket();
  }, [user.username, toast]);

  // Function to send a message
  const sendMessage = (text: string) => {
    if (socket && socket.readyState === WebSocket.OPEN && text.trim()) {
      socket.send(JSON.stringify({
        type: 'message',
        text
      }));
    } else if (!connected) {
      toast({
        title: "Não conectado",
        description: "Você está desconectado. Reconectando...",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    onlineUsers,
    connected,
    sendMessage
  };
}
