import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface LoginProps {
  onLogin: (username: string, userId: number) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite um nome de usuário.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      // Connect to WebSocket
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        // Send login message
        socket.send(JSON.stringify({
          type: 'login',
          username: username.trim()
        }));
      };
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'login_success') {
          // Store socket in session storage for reuse in Chat component
          window.sessionStorage.setItem('chatSocket', JSON.stringify({
            url: wsUrl,
            connected: true
          }));
          
          // Call the onLogin callback with user info
          onLogin(data.username, data.userId);
        } else if (data.type === 'error') {
          toast({
            title: "Erro",
            description: data.message,
            variant: "destructive",
          });
          socket.close();
          setIsLoggingIn(false);
        }
      };
      
      socket.onerror = () => {
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
          variant: "destructive",
        });
        setIsLoggingIn(false);
      };
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao entrar no chat.",
        variant: "destructive",
      });
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="bg-chat-bg min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-whatsapp-green mb-2">WhatsApp Web Clone</h1>
            <p className="text-gray-600">Digite um nome de usuário para entrar no chat</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Nome de usuário
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu nome"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                disabled={isLoggingIn}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-whatsapp-green hover:bg-whatsapp-teal text-white" 
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Entrando..." : "Entrar no Chat"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
