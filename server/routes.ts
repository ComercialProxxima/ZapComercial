import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { insertMessageSchema, insertUserSchema, ChatMessage } from "@shared/schema";

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

  const clients = new Map<number, ExtendedWebSocket>();

  // Broadcast to all connected clients
  function broadcast(message: any, excludeClient?: ExtendedWebSocket) {
    const data = JSON.stringify(message);
    
    wss.clients.forEach((client) => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Send online users count to all clients
  function updateOnlineUsers() {
    const onlineCount = clients.size;
    const message = {
      type: 'users',
      count: onlineCount
    };
    broadcast(message);
  }

  // Heartbeat to keep connections alive
  const pingInterval = setInterval(() => {
    wss.clients.forEach((client: ExtendedWebSocket) => {
      if (client.isAlive === false) {
        // User disconnected without proper close
        if (client.userId) {
          clients.delete(client.userId);
          broadcastSystemMessage(`${client.username} saiu do chat.`);
          updateOnlineUsers();
        }
        return client.terminate();
      }
      
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  // Helper to broadcast system messages
  function broadcastSystemMessage(text: string) {
    const systemMessage: ChatMessage = {
      text,
      username: 'Sistema',
      timestamp: new Date().toISOString(),
      isSystem: true
    };
    
    broadcast({ type: 'message', data: systemMessage });
  }

  // WebSocket connection handler
  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.isAlive = true;

    // Handle pong responses
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Message handling
    ws.on('message', async (rawData) => {
      try {
        const message = JSON.parse(rawData.toString());
        
        switch (message.type) {
          case 'login': {
            // Store user
            const user = await storage.createUser({ username: message.username });
            ws.userId = user.id;
            ws.username = user.username;
            clients.set(user.id, ws);
            
            // Notify about new user
            broadcastSystemMessage(`${user.username} entrou no chat.`);
            
            // Send confirmation to the user
            ws.send(JSON.stringify({ 
              type: 'login_success', 
              userId: user.id,
              username: user.username
            }));
            
            updateOnlineUsers();
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
            
            // Process and store the message
            const newMessage: ChatMessage = {
              text: message.text,
              username: ws.username,
              timestamp: new Date().toISOString()
            };
            
            // Broadcast the message to all connected clients
            broadcast({ type: 'message', data: newMessage });
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

    // Handle disconnection
    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
        broadcastSystemMessage(`${ws.username} saiu do chat.`);
        updateOnlineUsers();
      }
    });
  });

  // Clean up on server shutdown
  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  return httpServer;
}
