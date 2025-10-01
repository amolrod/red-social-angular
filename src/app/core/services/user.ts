import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { UserProfile } from '../../models/user-profile.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    const userSnap = await getDoc(userDoc);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  }

  async createUserProfile(userProfile: UserProfile): Promise<void> {
    const userDoc = doc(this.firestore, `users/${userProfile.uid}`);
    await setDoc(userDoc, userProfile);
  }

  async updateUserProfile(userProfile: UserProfile): Promise<void> {
    if (!userProfile.uid) {
      throw new Error('UID del usuario no proporcionado');
    }

    const userDocRef = doc(this.firestore, `users/${userProfile.uid}`);
    
    await updateDoc(userDocRef, {
      displayName: userProfile.displayName || '',
      bio: userProfile.bio || '',
      photoURL: userProfile.photoURL || ''
    });
  }

  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const currentUser = this.auth.currentUser;
    
    if (!currentUser) {
      throw new Error('No hay usuario autenticado');
    }
    
    return this.getUserProfile(currentUser.uid);
  }

  async updateCurrentUserProfile(updates: Partial<UserProfile>): Promise<void> {
    const currentUser = this.auth.currentUser;
    
    if (!currentUser) {
      throw new Error('No hay usuario autenticado');
    }

    const userDocRef = doc(this.firestore, `users/${currentUser.uid}`);
    
    await updateDoc(userDocRef, {
      ...updates,
      email: currentUser.email || ''
    });
  }
}
