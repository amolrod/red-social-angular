import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
  getDocs
} from '@angular/fire/firestore';
import { Observable, firstValueFrom, switchMap, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Conversation, Message } from '../../models/message.model';
import { AuthService } from '../auth/auth';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private firestore: Firestore = inject(Firestore);
  private auth: AuthService = inject(AuthService);
  private injector: Injector = inject(Injector);

  getUserConversations(): Observable<Conversation[]> {
    return this.auth.user$.pipe(
      switchMap(user => {
        if (!user) return of([]);
        
        const conversationsRef = collection(this.firestore, 'conversations');
        const q = query(
          conversationsRef,
          where('participants', 'array-contains', user.uid)
        );
        
        return (collectionData(q, { idField: 'id' }) as Observable<Conversation[]>).pipe(
          map(conversations => conversations.sort((a, b) => {
            const timeA = a.lastMessageTime instanceof Timestamp ? a.lastMessageTime.toMillis() : 0;
            const timeB = b.lastMessageTime instanceof Timestamp ? b.lastMessageTime.toMillis() : 0;
            return timeB - timeA;
          }))
        );
      })
    );
  }

  getConversationMessages(conversationId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'conversations/' + conversationId + '/messages');
    const q = query(messagesRef);
    
    return (collectionData(q, { idField: 'id' }) as Observable<Message[]>).pipe(
      map(messages => messages.sort((a, b) => {
        const timeA = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : 0;
        return timeA - timeB;
      }))
    );
  }

  async sendMessage(conversationId: string, content: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const user = await firstValueFrom(this.auth.user$);
      if (!user) throw new Error('Usuario no autenticado');

      const messagesRef = collection(this.firestore, 'conversations/' + conversationId + '/messages');
      
      const newMessage: Omit<Message, 'id'> = {
        conversationId,
        senderId: user.uid,
        senderEmail: user.email || '',
        content,
        timestamp: Timestamp.now() as any,
        read: false
      };

      await addDoc(messagesRef, newMessage);

      const conversationRef = doc(this.firestore, 'conversations/' + conversationId);
      await updateDoc(conversationRef, {
        lastMessage: content,
        lastMessageTime: Timestamp.now()
      });
    });
  }

  async createConversationWithEmail(otherUserEmail: string): Promise<string | null> {
    return runInInjectionContext(this.injector, async () => {
      const user = await firstValueFrom(this.auth.user$);
      if (!user || !user.email) throw new Error('Usuario no autenticado');

      if (otherUserEmail === user.email) {
        throw new Error('No puedes iniciar un chat contigo mismo');
      }

      const conversationsRef = collection(this.firestore, 'conversations');
      const q = query(
        conversationsRef,
        where('participantsEmails', 'array-contains', user.email)
      );

      const querySnapshot = await getDocs(q);
      
      for (const docSnap of querySnapshot.docs) {
        const conversation = docSnap.data() as Conversation;
        if (conversation.participantsEmails.includes(otherUserEmail)) {
          return docSnap.id;
        }
      }

      const usersRef = collection(this.firestore, 'users');
      const userQuery = query(usersRef, where('email', '==', otherUserEmail));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        throw new Error('El usuario con ese email no existe o no se ha registrado aún');
      }

      const otherUserUid = userSnapshot.docs[0].data()['uid'];

      const newConversation: Omit<Conversation, 'id'> = {
        participants: [user.uid, otherUserUid],
        participantsEmails: [user.email, otherUserEmail].sort(),
        lastMessage: '',
        lastMessageTime: Timestamp.now() as any,
        unreadCount: {}
      };

      const docRef = await addDoc(conversationsRef, newConversation);
      return docRef.id;
    });
  }

  async markAsRead(conversationId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const user = await firstValueFrom(this.auth.user$);
      if (!user) return;

      const conversationRef = doc(this.firestore, 'conversations/' + conversationId);
      await updateDoc(conversationRef, {
        ['unreadCount.' + user.uid]: 0
      });
    });
  }

  getOtherUserEmail(conversation: Conversation, currentUserEmail: string): string {
    return conversation.participantsEmails.find(email => email !== currentUserEmail) || 'Usuario';
  }
}
