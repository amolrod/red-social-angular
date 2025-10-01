import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  doc, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  getDoc
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class FollowService {
  private firestore: Firestore = inject(Firestore);

  async followUser(currentUserId: string, targetUserId: string): Promise<void> {
    if (currentUserId === targetUserId) {
      throw new Error('No puedes seguirte a ti mismo');
    }

    const currentUserRef = doc(this.firestore, `users/${currentUserId}`);
    const targetUserRef = doc(this.firestore, `users/${targetUserId}`);

    // Añadir targetUserId a la lista de "following" del usuario actual
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUserId),
      followingCount: increment(1)
    });

    // Añadir currentUserId a la lista de "followers" del usuario objetivo
    await updateDoc(targetUserRef, {
      followers: arrayUnion(currentUserId),
      followersCount: increment(1)
    });
  }

  async unfollowUser(currentUserId: string, targetUserId: string): Promise<void> {
    if (currentUserId === targetUserId) {
      throw new Error('No puedes dejar de seguirte a ti mismo');
    }

    const currentUserRef = doc(this.firestore, `users/${currentUserId}`);
    const targetUserRef = doc(this.firestore, `users/${targetUserId}`);

    // Remover targetUserId de la lista de "following" del usuario actual
    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUserId),
      followingCount: increment(-1)
    });

    // Remover currentUserId de la lista de "followers" del usuario objetivo
    await updateDoc(targetUserRef, {
      followers: arrayRemove(currentUserId),
      followersCount: increment(-1)
    });
  }

  async isFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
    const currentUserRef = doc(this.firestore, `users/${currentUserId}`);
    const currentUserSnap = await getDoc(currentUserRef);

    if (currentUserSnap.exists()) {
      const data = currentUserSnap.data();
      const following = data['following'] || [];
      return following.includes(targetUserId);
    }

    return false;
  }

  async getFollowersCount(userId: string): Promise<number> {
    const userRef = doc(this.firestore, `users/${userId}`);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return data['followersCount'] || 0;
    }

    return 0;
  }

  async getFollowingCount(userId: string): Promise<number> {
    const userRef = doc(this.firestore, `users/${userId}`);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return data['followingCount'] || 0;
    }

    return 0;
  }
}
