import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { insertMessageSchema, insertUserSchema, ChatMessage, ChatContact } from "@shared/schema";

interface ExtendedWebSocket extends WebSocket {
  isAlive?: boolean;
  userId?: number;
  username?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // REST API routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // HTTP server
  const httpServer = createServer(app);

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Armazenar clientes conectados por userId
  const clients = new Map<number, ExtendedWebSocket>();

  // Broadcast para todos os clientes conectados
  function broadcast(message: any, excludeClient?: ExtendedWebSocket) {
    const data = JSON.stringify(message);
    
    wss.clients.forEach((client) => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Enviar mensagem privada para um cliente específico
  function sendPrivateMessage(message: any, targetUserId: number, senderSocket: ExtendedWebSocket) {
    const targetClient = clients.get(targetUserId);
    
    if (targetClient && targetClient.readyState === WebSocket.OPEN) {
      targetClient.send(JSON.stringify(message));
      // Também enviar de volta para o remetente
      if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
        senderSocket.send(JSON.stringify(message));
      }
      return true;
    }
    return false;
  }

  // Enviar lista de usuários online para todos os clientes
  function updateOnlineUsersList() {
    const onlineUsers: ChatContact[] = [];
    
    // Criar a lista de usuários online
    clients.forEach((client, userId) => {
      if (client.username) {
        onlineUsers.push({
          id: userId,
          username: client.username,
          connected: true
        });
      }
    });
    
    // Adicionar o chat público como primeiro item
    onlineUsers.unshift({
      id: 0,
      username: 'Chat Público',
      connected: true
    });
    
    // Enviar para todos os clientes
    const message = {
      type: 'usersList',
      users: onlineUsers
    };
    
    console.log(`Enviando lista de ${onlineUsers.length} usuários:`, onlineUsers);
    
    // Enviar para cada cliente individualmente para garantir entrega
    wss.clients.forEach((client: ExtendedWebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Heartbeat para manter conexões ativas
  const pingInterval = setInterval(() => {
    wss.clients.forEach((client: ExtendedWebSocket) => {
      if (client.isAlive === false) {
        // Usuário desconectado sem fechar adequadamente
        if (client.userId) {
          clients.delete(client.userId);
          broadcastSystemMessage(`${client.username} saiu do chat.`);
          updateOnlineUsersList();
        }
        return client.terminate();
      }
      
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  // Enviar mensagem do sistema
  function broadcastSystemMessage(text: string) {
    const systemMessage: ChatMessage = {
      text,
      username: 'Sistema',
      timestamp: new Date().toISOString(),
      isSystem: true
    };
    
    broadcast({ type: 'message', data: systemMessage, chatId: 0 });
  }

  // Tratamento de conexão WebSocket
  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.isAlive = true;

    // Tratamento de respostas pong
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Tratamento de mensagens
    ws.on('message', async (rawData) => {
      try {
        const message = JSON.parse(rawData.toString());
        
        switch (message.type) {
          case 'login': {
            // Armazenar usuário
            const user = await storage.createUser({ username: message.username });
            ws.userId = user.id;
            ws.username = user.username;
            clients.set(user.id, ws);
            
            // Notificar sobre novo usuário
            broadcastSystemMessage(`${user.username} entrou no chat.`);
            
            // Enviar confirmação para o usuário
            ws.send(JSON.stringify({ 
              type: 'login_success', 
              userId: user.id,
              username: user.username
            }));
            
            // Atualizar lista de usuários online
            updateOnlineUsersList();
            break;
          }
          
          case 'message': {
            if (!ws.userId || !ws.username) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Não autenticado. Faça login primeiro.' 
              }));
              return;
            }
            
            const receiverId = message.receiverId || 0; // 0 para chat público
            
            // Criar objeto de mensagem
            const newMessage: ChatMessage = {
              text: message.text,
              username: ws.username,
              timestamp: new Date().toISOString(),
              senderId: ws.userId,
              receiverId: receiverId
            };
            
            if (receiverId === 0) {
              // Mensagem pública - enviar para todos
              broadcast({ 
                type: 'message', 
                data: newMessage,
                chatId: 0 
              });
            } else {
              // Mensagem privada - enviar apenas para o destinatário e o remetente
              const sent = sendPrivateMessage({ 
                type: 'message', 
                data: newMessage,
                chatId: receiverId === ws.userId ? ws.userId : receiverId
              }, receiverId, ws);
              
              if (!sent) {
                // Se o destinatário não estiver online
                ws.send(JSON.stringify({ 
                  type: 'error', 
                  message: 'Usuário não está online no momento.' 
                }));
              }
            }
            break;
          }
          
          case 'getUsers': {
            // Enviar a lista de usuários apenas para quem solicitou
            if (ws.readyState === WebSocket.OPEN) {
              const onlineUsers: ChatContact[] = [];
              
              // Criar a lista de usuários online
              clients.forEach((client, userId) => {
                if (client.username) {
                  onlineUsers.push({
                    id: userId,
                    username: client.username,
                    connected: true
                  });
                }
              });
              
              // Adicionar o chat público como primeiro item
              onlineUsers.unshift({
                id: 0,
                username: 'Chat Público',
                connected: true
              });
              
              // Enviar diretamente para este cliente
              ws.send(JSON.stringify({
                type: 'usersList',
                users: onlineUsers
              }));
              
              console.log(`Enviando lista direta de ${onlineUsers.length} usuários para o cliente`);
            }
            break;
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Erro ao processar mensagem' 
        }));
      }
    });

    // Tratamento de desconexão
    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
        broadcastSystemMessage(`${ws.username} saiu do chat.`);
        updateOnlineUsersList();
      }
    });
  });

  // Limpeza na desativação do servidor
  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  return httpServer;
}
