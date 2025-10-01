import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  collectionData, 
  doc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  Timestamp,
  getDoc
} from '@angular/fire/firestore';
import { 
  Storage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from '@angular/fire/storage';  // ← AÑADIDO
import { Observable, firstValueFrom } from 'rxjs';
import { Post } from '../../models/post.model';
import { AuthService } from '../auth/auth';

@Injectable({ providedIn: 'root' })
export class PostService {
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);  // ← AÑADIDO
  private auth: AuthService = inject(AuthService);
  private injector: Injector = inject(Injector);
  private postsCollection = collection(this.firestore, 'posts');

  getPosts(): Observable<Post[]> {
    const postsQuery = query(this.postsCollection, orderBy('createdAt', 'desc'));
    return collectionData(postsQuery, { idField: 'id' }) as Observable<Post[]>;
  }

  // MÉTODO ACTUALIZADO - Ahora soporta imágenes
  async createPost(content: string, imageFile?: File): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    let imageUrl: string | undefined = undefined;

    // Si hay imagen, subirla primero
    if (imageFile) {
      const timestamp = Date.now();
      const imagePath = `posts/${user.uid}/${timestamp}_${imageFile.name}`;
      const storageRef = ref(this.storage, imagePath);
      
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    const newPost: Omit<Post, 'id'> = {
      content,
      authorId: user.uid,
      authorEmail: user.email || 'Anónimo',
      createdAt: Timestamp.now() as any,
      likes: 0,
      likedBy: [],
      comments: [],
      imageUrl  // ← AÑADIDO
    };

    await addDoc(this.postsCollection, newPost);
  }

  async deletePost(postId: string): Promise<void> {
    const postDoc = doc(this.firestore, 'posts/' + postId);
    
    // Obtener el post para eliminar la imagen si existe
    const postSnap = await getDoc(postDoc);
    if (postSnap.exists()) {
      const post = postSnap.data() as Post;
      
      // Eliminar imagen de Storage si existe
      if (post.imageUrl) {
        try {
          const imageRef = ref(this.storage, post.imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn('No se pudo eliminar la imagen:', error);
        }
      }
    }
    
    await deleteDoc(postDoc);
  }

  async toggleLike(post: Post): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const postDoc = doc(this.firestore, 'posts/' + post.id);
    const hasLiked = post.likedBy.includes(user.uid);

    if (hasLiked) {
      await updateDoc(postDoc, {
        likes: post.likes - 1,
        likedBy: post.likedBy.filter(id => id !== user.uid)
      });
    } else {
      await updateDoc(postDoc, {
        likes: post.likes + 1,
        likedBy: [...post.likedBy, user.uid]
      });
    }
  }

  async addComment(postId: string, content: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const postDoc = doc(this.firestore, 'posts/' + postId);
    const postSnap = await getDoc(postDoc);
    
    if (postSnap.exists()) {
      const currentComments = postSnap.data()['comments'] || [];
      const newComment = {
        content,
        authorId: user.uid,
        authorEmail: user.email || 'Anónimo',
        createdAt: Timestamp.now()
      };

      await updateDoc(postDoc, {
        comments: [...currentComments, newComment]
      });
    }
  }

  private async getCurrentUser() {
    return runInInjectionContext(this.injector, async () => {
      try {
        const user = await firstValueFrom(this.auth.user$);
        return user;
      } catch (error) {
        console.error('Error al obtener usuario:', error);
        return null;
      }
    });
  }
}
