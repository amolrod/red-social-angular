import { Component, OnInit } from '@angular/core';
import { PostService } from '../../core/services/post';
import { AuthService } from '../../core/auth/auth';
import { Post } from '../../models/post.model';
import { Observable } from 'rxjs';
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
  
  // Estado de comentarios
  expandedPosts: Set<string> = new Set();  // Posts con comentarios expandidos
  newComments: Map<string, string> = new Map();  // Texto de nuevos comentarios

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.posts$ = this.postService.getPosts();
    
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
      }
    });
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

  // Toggle expandir/colapsar comentarios
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

  // Añadir comentario
  async addComment(postId: string | undefined) {
    if (!postId) return;
    
    const commentText = this.newComments.get(postId);
    if (!commentText || !commentText.trim()) return;

    try {
      await this.postService.addComment(postId, commentText);
      this.newComments.set(postId, '');  // Limpiar input
    } catch (error) {
      console.error('Error al añadir comentario:', error);
      alert('Error al comentar');
    }
  }

  // Obtener texto del nuevo comentario
  getNewCommentText(postId: string | undefined): string {
    if (!postId) return '';
    return this.newComments.get(postId) || '';
  }

  // Actualizar texto del nuevo comentario
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
