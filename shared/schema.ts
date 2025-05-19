import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  connected: boolean("connected").notNull().default(true),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  userId: integer("user_id").notNull(),
  receiverId: integer("receiver_id"),  // null para mensagens públicas
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  text: true, 
  userId: true,
  receiverId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Client message types
export interface ChatMessage {
  id?: number;
  text: string;
  username: string;
  timestamp: string;
  isSystem?: boolean;
  receiverId?: number;  // ID do destinatário para mensagens privadas
  senderId?: number;    // ID do remetente
}

export interface ChatContact {
  id: number;
  username: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: number;
  connected?: boolean;
}
