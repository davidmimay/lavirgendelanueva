import { Injectable, signal } from '@angular/core';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { firebaseAuth } from './firebase.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null | undefined>(undefined);
  error = signal<string | null>(null);

  constructor() {
    onAuthStateChanged(firebaseAuth, (user) => {
      this.currentUser.set(user);
    });
  }

  async loginWithGoogle(): Promise<boolean> {
    this.error.set(null);
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      return true;
    } catch {
      this.error.set('No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
      return false;
    }
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth);
  }
}