import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../core/services/user';
import { MessageService } from '../../core/services/message.service';
import { AuthService } from '../../core/auth/auth';
import { UserProfile } from '../../models/user-profile.model';
import { Router } from '@angular/router';
import { 
  Firestore, 
  collection, 
  query, 
  getDocs,
  limit
} from '@angular/fire/firestore';
import { inject } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
  standalone: false
})
export class Search implements OnInit {
  private firestore: Firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);  // ← AÑADIDO
  
  searchQuery: string = '';
  searchResults: UserProfile[] = [];
  isSearching: boolean = false;
  currentUserEmail: string = '';
  noResults: boolean = false;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUserEmail = user.email || '';
      }
    });
    
    this.loadFeaturedUsers();
  }

  async loadFeaturedUsers() {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, limit(10));
      const querySnapshot = await getDocs(q);
      
      this.searchResults = querySnapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(user => user.email !== this.currentUserEmail);
      
      this.cdr.detectChanges();  // ← AÑADIDO
        
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }

  async searchUsers() {
    if (!this.searchQuery.trim()) {
      this.loadFeaturedUsers();
      this.noResults = false;
      return;
    }

    this.isSearching = true;
    this.noResults = false;
    this.cdr.detectChanges();  // ← AÑADIDO

    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, limit(50));
      const querySnapshot = await getDocs(q);
      
      const searchLower = this.searchQuery.toLowerCase();
      
      this.searchResults = querySnapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(user => {
          if (user.email === this.currentUserEmail) return false;
          if (user.email?.toLowerCase().includes(searchLower)) return true;
          if (user.displayName?.toLowerCase().includes(searchLower)) return true;
          return false;
        });

      this.noResults = this.searchResults.length === 0;
      
      console.log('🔍 Búsqueda:', this.searchQuery);
      console.log('📊 Resultados:', this.searchResults.length);
      console.log('📋 Datos:', this.searchResults);
      
    } catch (error) {
      console.error('Error en búsqueda:', error);
      alert('Error al buscar usuarios');
    } finally {
      this.isSearching = false;
      this.cdr.detectChanges();  // ← AÑADIDO (IMPORTANTE)
    }
  }

  async startChat(user: UserProfile) {
    try {
      const conversationId = await this.messageService.createConversationWithEmail(user.email);
      
      if (conversationId) {
        this.router.navigate(['/messages']);
      }
    } catch (error: any) {
      console.error('Error al crear chat:', error);
      alert('Error al iniciar chat: ' + error.message);
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.noResults = false;
    this.loadFeaturedUsers();
  }
}
