import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { collection, doc, onSnapshot, serverTimestamp, setDoc, Unsubscribe } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, StorageReference, uploadBytes } from 'firebase/storage';
import { AuthService } from '../../core/auth';
import { firestoreDb, firebaseStorage } from '../../core/firebase.config';
import { PrayDialog, PrayerDraft } from './pray-dialog';

interface Prayer {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
}

@Component({
  imports: [MatButtonModule, MatCardModule, MatDialogModule, MatIconModule, RouterLink],
  selector: 'app-pray',
  styleUrl: './pray.scss',
  templateUrl: './pray.html',
})
export class Pray {
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  prayers = signal<Prayer[]>([]);
  flippedPrayerIds = signal<Set<string>>(new Set());
  prayersLoading = signal(true);
  prayersError = signal<string | null>(null);
  prayersWarning = signal<string | null>(null);
  canManagePrayers = signal(false);
  roleLoading = signal(true);
  roleError = signal<string | null>(null);
  creatingPrayer = signal(false);
  createError = signal<string | null>(null);
  createSuccess = signal<string | null>(null);

  private roleUnsubscribe?: Unsubscribe;

  constructor() {
    const prayersUnsubscribe = onSnapshot(
      collection(firestoreDb, 'prayers'),
      snapshot => {
        let hasInvalidPrayer = false;
        const prayers = snapshot.docs.flatMap(document => {
          const data = document.data();
          const title = data['title'] ?? data['titulo'];
          const content = data['content'] ?? data['contenido'];
          const imageUrl = data['imageUrl'];

          if (
            typeof title !== 'string' ||
            typeof content !== 'string' ||
            (imageUrl !== undefined && typeof imageUrl !== 'string')
          ) {
            console.error(`El documento ${document.id} de "prayers" no tiene título y contenido válidos.`);
            hasInvalidPrayer = true;
            return [];
          }

          return [{ id: document.id, title, content, ...(typeof imageUrl === 'string' ? { imageUrl } : {}) }];
        });

        this.prayers.set(prayers);
        this.prayersLoading.set(false);
        this.prayersError.set(null);
        this.prayersWarning.set(hasInvalidPrayer
          ? 'Algunas oraciones no se muestran porque sus campos de título o contenido no son válidos.'
          : null);
      },
      error => {
        console.error('Error al cargar las oraciones desde Firestore:', error);
        this.prayersLoading.set(false);
        this.prayersError.set('No se pudieron cargar las oraciones. Comprueba los permisos de Firestore e inténtalo de nuevo.');
      }
    );

    effect(() => this.syncRoleSubscription(this.authService.currentUser()));
    this.destroyRef.onDestroy(() => {
      prayersUnsubscribe();
      this.roleUnsubscribe?.();
    });
  }

  openCreateDialog(): void {
    this.createError.set(null);
    this.createSuccess.set(null);
    this.dialog.open(PrayDialog, {
      width: 'min(600px, 95vw)',
      maxWidth: '95vw'
    }).afterClosed().subscribe(draft => {
      if (draft) void this.createPrayer(draft);
    });
  }

  isPrayerFlipped(prayerId: string): boolean {
    return this.flippedPrayerIds().has(prayerId);
  }

  togglePrayer(prayerId: string): void {
    this.flippedPrayerIds.update(flippedIds => {
      const updatedIds = new Set(flippedIds);
      if (updatedIds.has(prayerId)) {
        updatedIds.delete(prayerId);
      } else {
        updatedIds.add(prayerId);
      }
      return updatedIds;
    });
  }

  onPrayerKeydown(event: KeyboardEvent, prayerId: string): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.togglePrayer(prayerId);
  }

  private async createPrayer(draft: PrayerDraft): Promise<void> {
    const user = this.authService.currentUser();
    if (!user || !this.canManagePrayers()) return;

    this.creatingPrayer.set(true);
    this.createError.set(null);
    this.createSuccess.set(null);
    let uploadedImage: StorageReference | undefined;
    let failedStep = 'la subida de la imagen a Storage';
    const prayerRef = doc(collection(firestoreDb, 'prayers'));

    try {
      let imageUrl: string | undefined;
      if (draft.image) {
        const imageRef = ref(firebaseStorage, `prayers/${prayerRef.id}`);
        const upload = await uploadBytes(imageRef, draft.image, { contentType: draft.image.type });
        uploadedImage = upload.ref;
        imageUrl = await getDownloadURL(uploadedImage);
      }

      failedStep = 'el guardado de la oración en Firestore';
      await setDoc(prayerRef, {
        title: draft.title,
        content: draft.content,
        ...(imageUrl && uploadedImage ? { imageUrl, imagePath: uploadedImage.fullPath } : {}),
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      this.createSuccess.set('La oración se añadió correctamente.');
    } catch (cause) {
      console.error(`Error durante ${failedStep}:`, cause);
      if (uploadedImage) {
        try {
          await deleteObject(uploadedImage);
        } catch (cleanupError) {
          console.error('No se pudo eliminar la imagen tras fallar el registro de la oración:', cleanupError);
        }
      }
      if (cause instanceof FirebaseError && cause.code === 'permission-denied') {
        this.createError.set(failedStep.includes('Firestore')
          ? 'Firestore rechazó el guardado. Comprueba que las reglas estén desplegadas y que tu usuario tenga rol de administrador.'
          : 'Storage rechazó la imagen. Comprueba que las reglas estén desplegadas, que tu usuario tenga rol de administrador y que el archivo sea una imagen de hasta 5 MB.');
      } else {
        this.createError.set('No se pudo añadir la oración. Comprueba la conexión e inténtalo de nuevo.');
      }
    } finally {
      this.creatingPrayer.set(false);
    }
  }

  private syncRoleSubscription(user: ReturnType<AuthService['currentUser']>): void {
    if (user === undefined) return;

    this.roleUnsubscribe?.();
    this.roleUnsubscribe = undefined;
    this.canManagePrayers.set(false);
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
        this.canManagePrayers.set(
          typeof role === 'string' &&
          ['admin', 'administrator', 'administrador'].includes(role.toLowerCase())
        );
        this.roleLoading.set(false);
      },
      cause => {
        console.error('Error al comprobar el rol para gestionar las oraciones:', cause);
        this.canManagePrayers.set(false);
        this.roleLoading.set(false);
        this.roleError.set('No se pudo comprobar si tienes permisos para añadir oraciones.');
      }
    );
  }
}