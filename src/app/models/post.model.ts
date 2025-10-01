import { Timestamp } from '@angular/fire/firestore';

export interface Post {
  id?: string;
  content: string;
  authorId: string;
  authorEmail: string;
  createdAt: Timestamp | Date;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  imageUrl?: string;  // ← AÑADIDO
}

export interface Comment {
  id?: string;
  content: string;
  authorId: string;
  authorEmail: string;
  createdAt: Timestamp | Date;
}
