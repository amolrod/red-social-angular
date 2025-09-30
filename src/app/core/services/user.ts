import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc
} from '@angular/fire/firestore';
import { UserProfile } from '../../models/user-profile.model';
import { AuthService } from '../auth/auth';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private firestore: Firestore = inject(Firestore);
  private auth: AuthService = inject(AuthService);

  async createOrUpdateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const userDoc = doc(this.firestore, 'users/' + userId);
    await setDoc(userDoc, data, { merge: true });
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userDoc = doc(this.firestore, 'users/' + userId);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  }

  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const user = await firstValueFrom(this.auth.user$);
    if (!user) return null;
    
    let profile = await this.getUserProfile(user.uid);
    
    if (!profile) {
      profile = {
        uid: user.uid,
        email: user.email || '',
        createdAt: new Date()
      };
      await this.createOrUpdateProfile(user.uid, profile);
    }
    
    return profile;
  }

  async updateCurrentUserProfile(data: Partial<UserProfile>): Promise<void> {
    const user = await firstValueFrom(this.auth.user$);
    if (!user) throw new Error('Usuario no autenticado');
    
    const userDoc = doc(this.firestore, 'users/' + user.uid);
    await updateDoc(userDoc, data);
  }
}
