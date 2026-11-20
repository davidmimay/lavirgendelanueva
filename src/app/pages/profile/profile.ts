import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { collection, onSnapshot, query, Timestamp, Unsubscribe, where } from 'firebase/firestore';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firestoreDb } from '../../core/firebase.config';
import type { CandleIntention } from '../candles/candles';


interface UserCandle {
  id: string;
  author: string;
  intention: CandleIntention;
  message: string;
  created: string;
}

function isCandleIntention(value: string): value is CandleIntention {
  return value === 'Pedir' || value === 'Ofrecer' || value === 'Agradecer' || value === 'Bendecir';
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private stopListening?: Unsubscribe;

  readonly candles = signal<UserCandle[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly displayName = computed(() => this.candles()[0]?.author ?? 'Perfil de usuario');

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.stopListening?.();
        this.candles.set([]);
        this.loading.set(true);
        this.error.set(null);

        const uid = params.get('uid');
        if (!uid) {
          this.loading.set(false);
          this.error.set('No se indicó un usuario válido.');
          return;
        }

        this.stopListening = onSnapshot(
          query(collection(firestoreDb, 'candles'), where('uid', '==', uid)),
          snapshot => {
            this.candles.set(snapshot.docs.flatMap(document => {
              const data = document.data();
              const { author, intention, message, created } = data;
              if (
                typeof author !== 'string' ||
                typeof intention !== 'string' ||
                !isCandleIntention(intention) ||
                typeof message !== 'string' ||
                !(created instanceof Timestamp)
              ) {
                console.error(`La vela ${document.id} tiene datos de perfil no válidos.`);
                return [];
              }

              return [{
                id: document.id,
                author,
                intention,
                message,
                created: created.toDate().toLocaleDateString('es-ES')
              }];
            }));
            this.loading.set(false);
          },
          cause => {
            console.error('Error al cargar las velas del usuario:', cause);
            this.loading.set(false);
            this.error.set('No se pudieron cargar las oraciones de este usuario.');
          }
        );
      });

    this.destroyRef.onDestroy(() => this.stopListening?.());
  }
}
