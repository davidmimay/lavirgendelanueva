import { Component, signal, computed, inject, DestroyRef, effect } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';

import { AuthService } from '../../core/auth';
import { firestoreDb } from '../../core/firebase.config';
import { Login } from '../../shared/login/login';
import { Polls } from './polls/polls';
import { Announcements } from './announcements/announcements';

export interface MemberProfile {
  name: string;
  memberNumber: string;
  sinceYear: number;
  role: string;
  feeStatus: 'Al corriente' | 'Pendiente';
  email: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    Login,
    Polls,
    Announcements
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  protected authService = inject(AuthService);

  // Datos combinados de la cuenta de Google + campos de hermano
  memberProfile = computed(() => {
    const user = this.authService.currentUser();

    return {
      uid: user?.uid ?? '',
      name: user?.displayName || 'Hermano/a',
      email: user?.email || 'Sin correo visible',
      photoUrl: user?.photoURL || null,
      // Valores provisionales hasta conectar con Firestore:
      memberNumber: '0418',
      role: 'Hermano/a de Número',
      feeStatus: 'Al corriente'
    };
  });

  // Datos del hermano autenticado (conectable a tu Auth/Firestore)
  member = signal<MemberProfile>({
    name: 'Carlos Mendoza Ruiz',
    memberNumber: '0418',
    sinceYear: 2012,
    role: 'Hermano de Número',
    feeStatus: 'Al corriente',
    email: 'carlos.mendoza@ejemplo.es'
  });

  canManageContent = signal(false);
  roleLoading = signal(true);
  roleError = signal<string | null>(null);

  private roleUnsubscribe?: Unsubscribe;

  constructor() {
    effect(() => this.syncRoleSubscription(this.authService.currentUser()));
    inject(DestroyRef).onDestroy(() => {
      this.roleUnsubscribe?.();
    });
  }

  private syncRoleSubscription(user: ReturnType<AuthService['currentUser']>): void {
    if (user === undefined) return;

    this.roleUnsubscribe?.();
    this.roleUnsubscribe = undefined;
    this.canManageContent.set(false);
    this.roleError.set(null);
    if (!user) {
      this.roleLoading.set(false);
      return;
    }

    this.roleLoading.set(true);
    this.roleUnsubscribe = onSnapshot(
      doc(firestoreDb, 'users', user.uid),
      snapshot => {
        const role = snapshot.data()?.['role'];
        this.canManageContent.set(
          typeof role === 'string' &&
          ['admin', 'administrator', 'administrador', 'president', 'presidente'].includes(role)
        );
        this.roleLoading.set(false);
      },
      error => {
        console.error('Error al comprobar el rol del usuario:', error);
        this.canManageContent.set(false);
        this.roleLoading.set(false);
        this.roleError.set('No se pudo comprobar tu rol de administración.');
      }
    );
  }
}