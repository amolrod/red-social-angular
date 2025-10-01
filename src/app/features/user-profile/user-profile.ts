import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/user';
import { PostService } from '../../core/services/post';
import { MessageService } from '../../core/services/message.service';
import { AuthService } from '../../core/auth/auth';
import { FollowService } from '../../core/services/follow.service';
import { UserProfile } from '../../models/user-profile.model';
import { Post } from '../../models/post.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss'],
  standalone: false
})
export class UserProfileComponent implements OnInit {
  userProfile: UserProfile | null = null;
  userPosts$: Observable<Post[]> = of([]);
  isLoading: boolean = true;
  errorMessage: string = '';
  currentUserId: string = '';
  isOwnProfile: boolean = false;
  
  isFollowing: boolean = false;
  isFollowLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private postService: PostService,
    private messageService: MessageService,
    private authService: AuthService,
    private followService: FollowService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const userId = params.get('userId');
      if (userId) {
        this.loadUserProfile(userId);
      }
    });

    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
      }
    });
  }

  async loadUserProfile(userId: string) {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.userProfile = await this.userService.getUserProfile(userId);

      if (!this.userProfile) {
        this.errorMessage = 'Usuario no encontrado';
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.isOwnProfile = this.userProfile.uid === this.currentUserId;
      
      if (!this.isOwnProfile && this.currentUserId) {
        this.isFollowing = await this.followService.isFollowing(
          this.currentUserId, 
          userId
        );
      }
      
      this.loadUserPosts(userId);
      this.cdr.detectChanges();

    } catch (error: any) {
      console.error('Error al cargar perfil:', error);
      this.errorMessage = 'Error al cargar el perfil';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadUserPosts(userId: string) {
    this.userPosts$ = this.postService.getPosts().pipe(
      map(posts => posts.filter(post => post.authorId === userId))
    );
  }

  async toggleFollow() {
    if (!this.userProfile || this.isOwnProfile) return;

    this.isFollowLoading = true;

    try {
      if (this.isFollowing) {
        await this.followService.unfollowUser(this.currentUserId, this.userProfile.uid);
        this.isFollowing = false;
        
        if (this.userProfile.followersCount !== undefined) {
          this.userProfile.followersCount--;
        }
      } else {
        await this.followService.followUser(this.currentUserId, this.userProfile.uid);
        this.isFollowing = true;
        
        if (this.userProfile.followersCount !== undefined) {
          this.userProfile.followersCount++;
        } else {
          this.userProfile.followersCount = 1;
        }
      }
      
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Error al seguir/dejar de seguir:', error);
      alert('Error: ' + error.message);
    } finally {
      this.isFollowLoading = false;
      this.cdr.detectChanges();
    }
  }

  async startChat() {
    if (!this.userProfile) return;

    try {
      const conversationId = await this.messageService.createConversationWithEmail(
        this.userProfile.email
      );

      if (conversationId) {
        this.router.navigate(['/messages']);
      }
    } catch (error: any) {
      console.error('Error al crear chat:', error);
      alert('Error al iniciar chat: ' + error.message);
    }
  }

  goToOwnProfile() {
    this.router.navigate(['/profile']);
  }

  getPostDate(createdAt: Timestamp | Date): Date {
    if (createdAt instanceof Timestamp) {
      return createdAt.toDate();
    }
    return createdAt;
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
