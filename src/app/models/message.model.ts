import { Timestamp } from '@angular/fire/firestore';

export interface Conversation {
  id?: string;
  participants: string[];  // Array con los UIDs de los 2 usuarios
  participantsEmails: string[];  // Emails para mostrar
  lastMessage: string;
  lastMessageTime: Timestamp | Date;
  unreadCount: { [userId: string]: number };  // Mensajes no leídos por usuario
}

export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  senderEmail: string;
  content: string;
  timestamp: Timestamp | Date;
  read: boolean;
}
