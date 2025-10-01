// core/services/storage.service.ts
import { Injectable, inject } from '@angular/core';
import { 
  Storage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  UploadTaskSnapshot 
} from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage: Storage = inject(Storage);

  uploadImage(file: File, path: string): Observable<number> {
    return new Observable(observer => {
      const timestamp = Date.now();
      const filePath = `${path}/${timestamp}_${file.name}`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          observer.next(progress);
        },
        (error) => {
          observer.error(error);
        },
        () => {
          observer.complete();
        }
      );
    });
  }

  async getImageUrl(file: File, path: string): Promise<string> {
    const timestamp = Date.now();
    const filePath = `${path}/${timestamp}_${file.name}`;
    const storageRef = ref(this.storage, filePath);
    
    await uploadBytesResumable(storageRef, file);
    return await getDownloadURL(storageRef);
  }
}
