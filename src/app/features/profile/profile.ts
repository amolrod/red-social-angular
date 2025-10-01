import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/auth/auth';
import { UserService } from '../../core/services/user';
import { PostService } from '../../core/services/post';
import { UserProfile } from '../../models/user-profile.model';
import { Post } from '../../models/post.model';
import { Observable, of, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  standalone: false
})
export class Profile implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  userPosts$: Observable<Post[]> = of([]);
  isLoading: boolean = true;
  isEditing: boolean = false;
  errorMessage: string = '';
  
  editDisplayName: string = '';
  editBio: string = '';
  
  private routerSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private postService: PostService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProfile();
    
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.router.url === '/profile') {
        this.loadProfile();
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  async loadProfile() {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      this.userProfile = await this.userService.getCurrentUserProfile();
      
      if (this.userProfile) {
        this.editDisplayName = this.userProfile.displayName || '';
        this.editBio = this.userProfile.bio || '';
        this.loadUserPosts();
        this.cdr.detectChanges();
      } else {
        this.errorMessage = 'No se pudo cargar el perfil';
      }
    } catch (error: any) {
      console.error('Error al cargar perfil:', error);
      this.errorMessage = 'Error al cargar el perfil: ' + error.message;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadUserPosts() {
    if (!this.userProfile) return;
    
    this.userPosts$ = this.postService.getPosts().pipe(
      map(posts => posts.filter(post => post.authorId === this.userProfile?.uid))
    );
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  async saveProfile() {
    if (!this.userProfile) return;

    try {
      await this.userService.updateCurrentUserProfile({
        displayName: this.editDisplayName,
        bio: this.editBio
      });
      
      this.userProfile.displayName = this.editDisplayName;
      this.userProfile.bio = this.editBio;
      
      this.isEditing = false;
      this.cdr.detectChanges();
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Error al guardar cambios');
    }
  }

  cancelEdit() {
    if (this.userProfile) {
      this.editDisplayName = this.userProfile.displayName || '';
      this.editBio = this.userProfile.bio || '';
    }
    this.isEditing = false;
  }

  async deletePost(postId: string | undefined) {
    if (!postId) return;
    if (!confirm('¿Eliminar este post?')) return;

    try {
      await this.postService.deletePost(postId);
    } catch (error) {
      console.error('Error al eliminar post:', error);
    }
  }

  getPostDate(createdAt: Timestamp | Date): Date {
    if (createdAt instanceof Timestamp) {
      return createdAt.toDate();
    }
    return createdAt;
  }
}
