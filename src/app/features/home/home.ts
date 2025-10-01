import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '../../core/services/post';
import { AuthService } from '../../core/auth/auth';
import { UserService } from '../../core/services/user';
import { Post } from '../../models/post.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  standalone: false
})
export class Home implements OnInit {
  posts$!: Observable<Post[]>;
  newPostContent: string = '';
  isLoading: boolean = false;
  currentUserId: string = '';
  
  expandedPosts: Set<string> = new Set();
  newComments: Map<string, string> = new Map();
  
  showFollowingOnly: boolean = false;
  currentUserFollowing: string[] = [];

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPosts();
    
    this.authService.user$.subscribe(async user => {
      if (user) {
        this.currentUserId = user.uid;
        
        const userProfile = await this.userService.getUserProfile(user.uid);
        if (userProfile) {
          this.currentUserFollowing = userProfile.following || [];
          console.log('✅ Usuario cargado. Sigue a:', this.currentUserFollowing);
        }
        
        this.loadPosts();
        this.cdr.detectChanges();
      }
    });
  }

  loadPosts() {
    this.posts$ = this.postService.getPosts().pipe(
      map(posts => {
        if (this.showFollowingOnly) {
          if (this.currentUserFollowing.length === 0) {
            console.log('⚠️ No sigues a nadie, mostrando solo tus posts');
            return posts.filter(post => post.authorId === this.currentUserId);
          }
          
          const filtered = posts.filter(post => 
            this.currentUserFollowing.includes(post.authorId) || 
            post.authorId === this.currentUserId
          );
          console.log(`✅ Filtrado: ${filtered.length} de ${posts.length} posts`);
          return filtered;
        }
        
        return posts;
      })
    );
  }

  toggleFeedFilter() {
    this.showFollowingOnly = !this.showFollowingOnly;
    console.log('🔄 Filtro:', this.showFollowingOnly ? 'Siguiendo' : 'Todos');
    this.loadPosts();
    this.cdr.detectChanges();
  }

  async createPost() {
    if (!this.newPostContent.trim()) return;

    this.isLoading = true;
    try {
      await this.postService.createPost(this.newPostContent);
      this.newPostContent = '';
    } catch (error) {
      console.error('Error al crear post:', error);
      alert('Error al crear el post');
    } finally {
      this.isLoading = false;
    }
  }

  async deletePost(postId: string | undefined, authorId: string) {
    if (!postId) return;
    
    if (authorId !== this.currentUserId) {
      alert('No puedes eliminar posts de otros usuarios');
      return;
    }
    
    if (!confirm('¿Eliminar este post?')) return;

    try {
      await this.postService.deletePost(postId);
    } catch (error) {
      console.error('Error al eliminar post:', error);
    }
  }

  async toggleLike(post: Post) {
    try {
      await this.postService.toggleLike(post);
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  }

  toggleComments(postId: string | undefined) {
    if (!postId) return;
    
    if (this.expandedPosts.has(postId)) {
      this.expandedPosts.delete(postId);
    } else {
      this.expandedPosts.add(postId);
    }
  }

  isCommentsExpanded(postId: string | undefined): boolean {
    if (!postId) return false;
    return this.expandedPosts.has(postId);
  }

  async addComment(postId: string | undefined) {
    if (!postId) return;
    
    const commentText = this.newComments.get(postId);
    if (!commentText || !commentText.trim()) return;

    try {
      await this.postService.addComment(postId, commentText);
      this.newComments.set(postId, '');
    } catch (error) {
      console.error('Error al añadir comentario:', error);
      alert('Error al comentar');
    }
  }

  getNewCommentText(postId: string | undefined): string {
    if (!postId) return '';
    return this.newComments.get(postId) || '';
  }

  setNewCommentText(postId: string | undefined, text: string) {
    if (!postId) return;
    this.newComments.set(postId, text);
  }

  hasLiked(post: Post): boolean {
    return post.likedBy?.includes(this.currentUserId) || false;
  }

  isOwnPost(authorId: string): boolean {
    return authorId === this.currentUserId;
  }

  viewUserProfile(userId: string) {
    this.router.navigate(['/user', userId]);
  }

  getPostDate(createdAt: Timestamp | Date): Date {
    if (createdAt instanceof Timestamp) {
      return createdAt.toDate();
    }
    return createdAt;
  }

  getCommentDate(createdAt: any): Date {
    if (createdAt instanceof Timestamp) {
      return createdAt.toDate();
    }
    return createdAt;
  }
}
