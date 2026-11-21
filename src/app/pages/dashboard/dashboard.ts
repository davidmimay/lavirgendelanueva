import { Component, signal, computed, inject, DestroyRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, Timestamp, Unsubscribe } from 'firebase/firestore';

import { AuthService } from '../../core/auth';
import { firestoreDb } from '../../core/firebase.config';
import { Login } from '../../shared/login/login';
import { Polls } from './polls/polls';

export interface MemberProfile {
  name: string;
  memberNumber: string;
  sinceYear: number;
  role: string;
  feeStatus: 'Al corriente' | 'Pendiente';
  email: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  tag: 'Cabildo' | 'Cultos' | 'Obra Social' | 'Aviso';
  summary: string;
}

function isAnnouncementTag(value: string): value is NewsItem['tag'] {
  return value === 'Cabildo' || value === 'Cultos' || value === 'Obra Social' || value === 'Aviso';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    Login,
    Polls
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

  news = signal<NewsItem[]>([]);
  announcementsLoading = signal(true);
  announcementsError = signal<string | null>(null);
  announcementTitle = signal('');
  announcementSummary = signal('');
  announcementTag = signal<NewsItem['tag']>('Aviso');
  creatingAnnouncement = signal(false);
  createAnnouncementError = signal<string | null>(null);
  createAnnouncementSuccess = signal<string | null>(null);

  canManageContent = signal(false);
  roleLoading = signal(true);
  roleError = signal<string | null>(null);

  private roleUnsubscribe?: Unsubscribe;
  private announcementsUnsubscribe?: Unsubscribe;

  constructor() {
    this.announcementsUnsubscribe = onSnapshot(
      collection(firestoreDb, 'announcements'),
      snapshot => {
        let invalidAnnouncement = false;
        const announcements = snapshot.docs.flatMap(document => {
          const data = document.data();
          const title = data['title'];
          const summary = data['summary'];
          const tag = data['tag'];
          const date = data['date'];
          const createdAt = data['createdAt'];

          if (
            typeof title !== 'string' ||
            typeof summary !== 'string' ||
            typeof tag !== 'string' ||
            !isAnnouncementTag(tag) ||
            !(typeof date === 'string' || createdAt instanceof Timestamp)
          ) {
            console.error(`El anuncio ${document.id} tiene un formato no válido.`);
            invalidAnnouncement = true;
            return [];
          }

          return [{
            id: document.id,
            title,
            summary,
            tag,
            date: typeof date === 'string'
              ? date
              : createdAt.toDate().toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
          }];
        });

        this.news.set(announcements);
        this.announcementsLoading.set(false);
        this.announcementsError.set(invalidAnnouncement
          ? 'Algunos anuncios no se muestran porque sus datos no son válidos.'
          : null);
      },
      error => {
        console.error('Error al cargar los anuncios desde Firestore:', error);
        this.announcementsLoading.set(false);
        this.announcementsError.set('No se pudieron cargar las noticias y circulares. Comprueba los permisos de Firestore.');
      }
    );

    effect(() => this.syncRoleSubscription(this.authService.currentUser()));
    inject(DestroyRef).onDestroy(() => {
      this.announcementsUnsubscribe?.();
      this.roleUnsubscribe?.();
    });
  }

  canSubmitAnnouncement(): boolean {
    return this.canManageContent()
      && !!this.announcementTitle().trim()
      && !!this.announcementSummary().trim()
      && !this.creatingAnnouncement();
  }

  async createAnnouncement(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user || !this.canSubmitAnnouncement()) return;

    this.creatingAnnouncement.set(true);
    this.createAnnouncementError.set(null);
    this.createAnnouncementSuccess.set(null);
    try {
      await addDoc(collection(firestoreDb, 'announcements'), {
        title: this.announcementTitle().trim(),
        summary: this.announcementSummary().trim(),
        tag: this.announcementTag(),
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      this.announcementTitle.set('');
      this.announcementSummary.set('');
      this.announcementTag.set('Aviso');
      this.createAnnouncementSuccess.set('La noticia o circular se publicó correctamente.');
    } catch (error) {
      console.error('Error al crear el anuncio en Firestore:', error);
      this.createAnnouncementError.set('No se pudo publicar el anuncio. Comprueba tu rol y las reglas de Firestore.');
    } finally {
      this.creatingAnnouncement.set(false);
    }
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