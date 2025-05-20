import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "linear-gradient(135deg, #D22887 0%, #2B3491 100%)",
      }}
    >
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ZapComercial
          </CardTitle>
          <CardDescription className="text-lg">
            Informe seu nome para entrar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Seu nome
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu nome para entrar"
                required
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoggingIn}
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-medium" 
              disabled={isLoggingIn}
              size="lg"
            >
              {isLoggingIn ? "Entrando..." : "Entrar no Chat"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
