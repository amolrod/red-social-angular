import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  onAuthStateChanged
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);

  get user$(): Observable<User | null> {
    return new Observable(observer => {
      onAuthStateChanged(this.auth, (user) => {
        observer.next(user);
      });
    });
  }

  async signUp(email: string, password: string): Promise<User | null> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      return credential.user;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<User | null> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return credential.user;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      await this.router.navigate(['/sign-in']);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }
}
