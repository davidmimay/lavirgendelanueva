import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { FirebaseError } from 'firebase/app';
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Unsubscribe
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  StorageReference,
  uploadBytes
} from 'firebase/storage';
import { AuthService } from '../../core/auth';
import { firestoreDb, firebaseStorage } from '../../core/firebase.config';
import { MuseumPieceDialog, MuseumPieceDraft } from './museum-piece-dialog';

export interface MuseumCategory {
  id: string;
  name: {
    en: string;
    es: string;
  };
}

export interface MuseumPiece {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  patron?: string;
  imageUrl: string;
  description: string;
}

function isAdminRole(role: unknown): boolean {
  return typeof role === 'string'
    && ['admin', 'administrator', 'administrador'].includes(role.toLowerCase());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

@Component({
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule
  ],
  selector: 'app-museum',
  templateUrl: './museum.html',
  styleUrl: './museum.scss'
})
export class Museum {
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly selectedCategory = signal<string>('Todas');
  readonly categories = signal<MuseumCategory[]>([]);
  readonly categoriesLoading = signal(true);
  readonly categoriesError = signal<string | null>(null);
  readonly pieces = signal<MuseumPiece[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly canManagePieces = signal(false);
  readonly roleLoading = signal(true);
  readonly roleError = signal<string | null>(null);
  readonly creatingPiece = signal(false);
  readonly createError = signal<string | null>(null);
  readonly createSuccess = signal<string | null>(null);

  private roleUnsubscribe?: Unsubscribe;

  readonly filteredPieces = computed(() => {
    const category = this.selectedCategory();
    if (category === 'Todas') return this.pieces();
    return this.pieces().filter(piece => piece.category === category);
  });

  constructor() {
    const piecesUnsubscribe = onSnapshot(
      collection(firestoreDb, 'museum'),
      snapshot => {
        let hasInvalidPiece = false;
        const pieces = snapshot.docs.flatMap(document => {
          const data = document.data();
          const title = data['title'];
          const subtitle = data['subtitle'];
          const category = data['category'];
          const year = data['year'];
          const patron = data['patron'];
          const imageUrl = data['imageUrl'];
          const description = data['description'];

          if (
            typeof title !== 'string' ||
            typeof subtitle !== 'string' ||
            typeof category !== 'string' ||
            typeof year !== 'string' ||
            typeof imageUrl !== 'string' ||
            typeof description !== 'string'
          ) {
            console.error(`La pieza ${document.id} tiene un formato no válido.`);
            hasInvalidPiece = true;
            return [];
          }

          return [{
            id: document.id,
            title,
            subtitle,
            category,
            year,
            patron: typeof patron === 'string' ? patron : undefined,
            imageUrl,
            description
          }];
        });

        this.pieces.set(pieces);
        this.loading.set(false);
        this.error.set(hasInvalidPiece
          ? 'Algunas piezas no se muestran porque sus datos no son válidos.'
          : null);
      },
      cause => {
        console.error('Error al cargar las piezas del museo:', cause);
        this.loading.set(false);
        this.error.set('No se pudieron cargar las piezas del museo. Comprueba los permisos de Firestore.');
      }
    );

    const categoriesUnsubscribe = onSnapshot(
      collection(firestoreDb, 'categories'),
      snapshot => {
        let hasInvalidCategory = false;
        const categories = snapshot.docs.flatMap(document => {
          const name = document.data()['name'];
          if (
            !isRecord(name) ||
            typeof name['en'] !== 'string' ||
            typeof name['es'] !== 'string'
          ) {
            console.error(`La categoría ${document.id} tiene un campo "name" no válido.`);
            hasInvalidCategory = true;
            return [];
          }
          return [{ id: document.id, name: { en: name['en'], es: name['es'] } }];
        });

        this.categories.set(categories);
        this.categoriesLoading.set(false);
        this.categoriesError.set(hasInvalidCategory
          ? 'Algunas categorías no se muestran porque sus nombres no son válidos.'
          : null);
      },
      cause => {
        console.error('Error al cargar las categorías del museo:', cause);
        this.categoriesLoading.set(false);
        this.categoriesError.set('No se pudieron cargar las categorías del museo.');
      }
    );

    effect(() => this.syncRoleSubscription(this.authService.currentUser()));
    this.destroyRef.onDestroy(() => {
      piecesUnsubscribe();
      categoriesUnsubscribe();
      this.roleUnsubscribe?.();
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  openCreateDialog(): void {
    this.createError.set(null);
    this.createSuccess.set(null);
    this.dialog.open(MuseumPieceDialog, {
      width: 'min(640px, 95vw)',
      maxWidth: '95vw',
      data: this.categories()
    }).afterClosed().subscribe(draft => {
      if (draft) void this.createPiece(draft);
    });
  }

  categoryName(categoryId: string): string {
    return this.categories().find(category => category.id === categoryId)?.name.es ?? categoryId;
  }

  private async createPiece(draft: MuseumPieceDraft): Promise<void> {
    const user = this.authService.currentUser();
    if (!user || !this.canManagePieces()) return;

    this.creatingPiece.set(true);
    this.createError.set(null);
    this.createSuccess.set(null);
    let uploadedImage: StorageReference | undefined;

    try {
      const pieceRef = doc(collection(firestoreDb, 'museum'));
      let imageUrl = '';
      let imagePath = '';
      if (draft.image) {
        const imageRef = ref(firebaseStorage, `museum/${pieceRef.id}`);
        const upload = await uploadBytes(imageRef, draft.image, { contentType: draft.image.type });
        uploadedImage = upload.ref;
        imageUrl = await getDownloadURL(uploadedImage);
        imagePath = uploadedImage.fullPath;
      }

      await setDoc(pieceRef, {
        title: draft.title,
        subtitle: draft.subtitle,
        category: draft.category,
        year: draft.year,
        patron: draft.patron,
        imageUrl,
        imagePath,
        description: draft.description,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      this.createSuccess.set('La pieza se añadió al museo correctamente.');
    } catch (cause) {
      console.error('Error al añadir la pieza al museo:', cause);
      if (uploadedImage) {
        try {
          await deleteObject(uploadedImage);
        } catch (cleanupError) {
          console.error('No se pudo eliminar la imagen tras fallar el registro de la pieza:', cleanupError);
        }
      }
      this.createError.set(cause instanceof FirebaseError && cause.code === 'permission-denied'
        ? 'Firebase rechazó la operación. Comprueba que las reglas de Firestore y Storage estén desplegadas y que tu usuario tenga rol admin.'
        : 'No se pudo añadir la pieza. Comprueba la conexión e inténtalo de nuevo.');
    } finally {
      this.creatingPiece.set(false);
    }
  }

  private syncRoleSubscription(user: ReturnType<AuthService['currentUser']>): void {
    if (user === undefined) return;

    this.roleUnsubscribe?.();
    this.roleUnsubscribe = undefined;
    this.canManagePieces.set(false);
    this.roleError.set(null);
    if (!user) {
      this.roleLoading.set(false);
      return;
    }

    this.roleLoading.set(true);
    this.roleUnsubscribe = onSnapshot(
      doc(firestoreDb, 'users', user.uid),
      snapshot => {
        this.canManagePieces.set(isAdminRole(snapshot.data()?.['role']));
        this.roleLoading.set(false);
      },
      cause => {
        console.error('Error al comprobar el rol para gestionar el museo:', cause);
        this.canManagePieces.set(false);
        this.roleLoading.set(false);
        this.roleError.set('No se pudo comprobar si tienes permisos para añadir piezas.');
      }
    );
  }
}
