import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { MessageService } from '../../core/services/message.service';
import { AuthService } from '../../core/auth/auth';
import { Conversation, Message } from '../../models/message.model';
import { Observable, of } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.html',
  styleUrls: ['./messages.scss'],
  standalone: false
})
export class Messages implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  conversations$: Observable<Conversation[]> = of([]);
  selectedConversation: Conversation | null = null;
  messages$: Observable<Message[]> = of([]);
  newMessageText: string = '';
  newChatEmail: string = '';
  currentUserEmail: string = '';
  showNewChatDialog: boolean = false;
  isCreatingChat: boolean = false;  // ← AÑADIDO
  
  private shouldScrollToBottom = false;

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.conversations$ = this.messageService.getUserConversations();
    
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUserEmail = user.email || '';
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.messages$ = this.messageService.getConversationMessages(conversation.id!);
    this.shouldScrollToBottom = true;
    
    this.messageService.markAsRead(conversation.id!);
  }

  async sendMessage() {
    if (!this.newMessageText.trim() || !this.selectedConversation) return;

    try {
      await this.messageService.sendMessage(this.selectedConversation.id!, this.newMessageText);
      this.newMessageText = '';
      this.shouldScrollToBottom = true;
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar el mensaje: ' + error.message);
    }
  }

  // MÉTODO MEJORADO CON MEJOR FEEDBACK
  async startNewChat() {
    if (!this.newChatEmail.trim()) {
      alert('Por favor ingresa un email');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newChatEmail)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    this.isCreatingChat = true;

    try {
      console.log('🔥 Creando conversación con:', this.newChatEmail);
      
      const conversationId = await this.messageService.createConversationWithEmail(this.newChatEmail);
      
      console.log('🔥 Conversación creada con ID:', conversationId);
      
      if (conversationId) {
        this.showNewChatDialog = false;
        this.newChatEmail = '';
        
        // Forzar recarga de conversaciones
        this.conversations$ = this.messageService.getUserConversations();
        
        alert('Chat creado exitosamente. Ya puedes enviar mensajes.');
      }
    } catch (error: any) {
      console.error('🔥 Error al crear conversación:', error);
      
      if (error.message.includes('no existe')) {
        alert('El usuario con ese email no existe. Asegúrate de que el usuario se haya registrado y accedido a su perfil al menos una vez.');
      } else if (error.message.includes('consigo mismo')) {
        alert('No puedes iniciar un chat contigo mismo');
      } else {
        alert('Error al crear la conversación: ' + error.message);
      }
    } finally {
      this.isCreatingChat = false;
    }
  }

  getOtherUserEmail(conversation: Conversation): string {
    return this.messageService.getOtherUserEmail(conversation, this.currentUserEmail);
  }

  isMyMessage(message: Message): boolean {
    return message.senderEmail === this.currentUserEmail;
  }

  getMessageDate(timestamp: Timestamp | Date): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    return timestamp;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  toggleNewChatDialog() {
    this.showNewChatDialog = !this.showNewChatDialog;
    this.newChatEmail = '';
  }
}
