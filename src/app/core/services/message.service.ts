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
  getDocs,
  CollectionReference
} from '@angular/fire/firestore';
import { Observable, firstValueFrom, switchMap, of, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Conversation, Message } from '../../models/message.model';
import { AuthService } from '../auth/auth';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private firestore: Firestore = inject(Firestore);
  private auth: AuthService = inject(AuthService);
  private injector: Injector = inject(Injector);

  getUserConversations(): Observable<Conversation[]> {
    return runInInjectionContext(this.injector, () => {
      return this.auth.user$.pipe(
        switchMap(user => {
          if (!user || !user.email) return of([]);
          
          console.log('👤 Usuario actual:', user.email);
          
          const conversationsRef = collection(this.firestore, 'conversations');
          
          // USAR EMAIL EN LUGAR DE UID ✅
          const q = query(
            conversationsRef,
            where('participantsEmails', 'array-contains', user.email)
          );
          
          return (collectionData(q, { idField: 'id' }) as Observable<Conversation[]>).pipe(
            map(conversations => {
              console.log('🔥 Conversaciones obtenidas:', conversations.length);
              return conversations.sort((a, b) => {
                const timeA = a.lastMessageTime instanceof Timestamp 
                  ? a.lastMessageTime.toMillis() 
                  : new Date(a.lastMessageTime).getTime();
                const timeB = b.lastMessageTime instanceof Timestamp 
                  ? b.lastMessageTime.toMillis() 
                  : new Date(b.lastMessageTime).getTime();
                return timeB - timeA;
              });
            }),
            catchError(error => {
              console.error('❌ Error al obtener conversaciones:', error);
              return of([]);
            })
          );
        })
      );
    });
  }


  getConversationMessages(conversationId: string): Observable<Message[]> {
    return runInInjectionContext(this.injector, () => {
      const messagesRef = collection(this.firestore, `conversations/${conversationId}/messages`);
      const q = query(messagesRef);
      
      return (collectionData(q, { idField: 'id' }) as Observable<Message[]>).pipe(
        map(messages => {
          return messages.sort((a, b) => {
            const timeA = a.timestamp instanceof Timestamp 
              ? a.timestamp.toMillis() 
              : new Date(a.timestamp).getTime();
            const timeB = b.timestamp instanceof Timestamp 
              ? b.timestamp.toMillis() 
              : new Date(b.timestamp).getTime();
            return timeA - timeB;
          });
        }),
        catchError(error => {
          console.error('❌ Error al obtener mensajes:', error);
          return of([]);
        })
      );
    });
  }

  async sendMessage(conversationId: string, content: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const user = await firstValueFrom(this.auth.user$);
      if (!user) throw new Error('Usuario no autenticado');

      const messagesRef = collection(this.firestore, `conversations/${conversationId}/messages`);
      
      const newMessage: Omit<Message, 'id'> = {
        conversationId,
        senderId: user.uid,
        senderEmail: user.email || '',
        content,
        timestamp: Timestamp.now() as any,
        read: false
      };

      await addDoc(messagesRef, newMessage);

      const conversationRef = doc(this.firestore, `conversations/${conversationId}`);
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

      if (otherUserEmail.toLowerCase() === user.email.toLowerCase()) {
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
        if (conversation.participantsEmails.some(email => 
          email.toLowerCase() === otherUserEmail.toLowerCase()
        )) {
          console.log('✅ Conversación existente encontrada:', docSnap.id);
          return docSnap.id;
        }
      }

      const usersRef = collection(this.firestore, 'users');
      const userQuery = query(usersRef, where('email', '==', otherUserEmail));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        throw new Error('El usuario con ese email no existe. Asegúrate de que se haya registrado y accedido a su perfil al menos una vez.');
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
      console.log('🆕 Nueva conversación creada:', docRef.id);
      return docRef.id;
    });
  }

  async markAsRead(conversationId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const user = await firstValueFrom(this.auth.user$);
      if (!user) return;

      const conversationRef = doc(this.firestore, `conversations/${conversationId}`);
      await updateDoc(conversationRef, {
        [`unreadCount.${user.uid}`]: 0
      });
    });
  }

  getOtherUserEmail(conversation: Conversation, currentUserEmail: string): string {
    return conversation.participantsEmails.find(email => 
      email.toLowerCase() !== currentUserEmail.toLowerCase()
    ) || 'Usuario';
  }
}
