import { Timestamp } from '@angular/fire/firestore';  // ← AÑADIR

export interface Post {
  id?: string;
  content: string;
  authorId: string;
  authorEmail: string;
  createdAt: Timestamp | Date;  // ← CAMBIAR: puede ser Timestamp o Date
  likes: number;
  likedBy: string[];
  comments: Comment[];
}

export interface Comment {
  id?: string;
  content: string;
  authorId: string;
  authorEmail: string;
  createdAt: Timestamp | Date;  // ← CAMBIAR
}
