import { Component, Output, EventEmitter } from '@angular/core';
import { PostService } from '../../core/services/post';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
  standalone: false
})
export class CreatePostComponent {
  @Output() postCreated = new EventEmitter<void>();
  
  newPostContent: string = '';
  isLoading: boolean = false;

  constructor(private postService: PostService) {}

  async createPost() {
    if (!this.newPostContent.trim()) return;

    this.isLoading = true;
    try {
      await this.postService.createPost(this.newPostContent);
      this.newPostContent = '';
      this.postCreated.emit();
    } catch (error) {
      console.error('Error al crear post:', error);
      alert('Error al crear el post');
    } finally {
      this.isLoading = false;
    }
  }
}
