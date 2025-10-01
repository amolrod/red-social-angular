export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  followers?: string[];      // ← AÑADIDO (UIDs de seguidores)
  following?: string[];      // ← AÑADIDO (UIDs que sigue)
  followersCount?: number;   // ← AÑADIDO (contador)
  followingCount?: number;   // ← AÑADIDO (contador)
}
