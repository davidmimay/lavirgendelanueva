import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { addDoc, collection, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { AuthService } from '../../../core/auth';
import { firestoreDb } from '../../../core/firebase.config';
import { AnnouncementDialog, AnnouncementDraft, AnnouncementTag } from './announcement-dialog';

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  tag: AnnouncementTag;
  summary: string;
}

function isAnnouncementTag(value: string): value is AnnouncementTag {
  return value === 'Cabildo' || value === 'Cultos' || value === 'Obra Social' || value === 'Aviso';
}

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatDialogModule, MatIconModule],
  templateUrl: './announcements.html',
  styleUrl: './announcements.scss'
})
export class Announcements {
  readonly canManage = input(false);
  readonly roleLoading = input(false);
  readonly roleError = input<string | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly items = signal<NewsItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly createError = signal<string | null>(null);
  readonly createSuccess = signal<string | null>(null);
  readonly creating = signal(false);

  constructor() {
    const unsubscribe = onSnapshot(
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

        this.items.set(announcements);
        this.loading.set(false);
        this.error.set(invalidAnnouncement
          ? 'Algunos anuncios no se muestran porque sus datos no son válidos.'
          : null);
      },
      error => {
        console.error('Error al cargar los anuncios desde Firestore:', error);
        this.loading.set(false);
        this.error.set('No se pudieron cargar las noticias y circulares. Comprueba los permisos de Firestore.');
      }
    );

    this.destroyRef.onDestroy(unsubscribe);
  }

  openCreateDialog(): void {
    this.createError.set(null);
    this.createSuccess.set(null);
    this.dialog.open(AnnouncementDialog, {
      width: 'min(600px, 95vw)',
      maxWidth: '95vw'
    }).afterClosed().subscribe(draft => {
      if (draft) void this.createAnnouncement(draft);
    });
  }

  private async createAnnouncement(draft: AnnouncementDraft): Promise<void> {
    const user = this.authService.currentUser();
    if (!user || !this.canManage()) return;

    this.creating.set(true);
    this.createError.set(null);
    this.createSuccess.set(null);
    try {
      await addDoc(collection(firestoreDb, 'announcements'), {
        ...draft,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });
      this.createSuccess.set('La noticia o circular se publicó correctamente.');
    } catch (error) {
      console.error('Error al crear el anuncio en Firestore:', error);
      this.createError.set('No se pudo publicar el anuncio. Comprueba tu rol y las reglas de Firestore.');
    } finally {
      this.creating.set(false);
    }
  }
}
