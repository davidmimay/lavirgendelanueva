import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { FirebaseError } from 'firebase/app';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { AuthService } from '../../core/auth';
import { firestoreDb } from '../../core/firebase.config';
import { Login } from '../../shared/login/login';

export type CandleIntention = 'Pedir' | 'Ofrecer' | 'Agradecer' | 'Bendecir';

export interface IntentionOption {
  value: CandleIntention;
  emoji: string;
  label: string;
}

export interface CandleEntry {
  id: string;
  author: string;
  intention: CandleIntention;
  message: string;
  createdAt: string;
  prayersCount: number;
  prayedByMe?: boolean;
}

interface CandleDocument {
  author: string;
  intention: CandleIntention;
  message: string;
  createdAt: Timestamp;
  prayersCount: number;
}

@Component({
  selector: 'app-candles',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDividerModule,
    Login
  ],
  templateUrl: './candles.html',
  styleUrl: './candles.scss'
})
export class Candles {
  protected readonly authService = inject(AuthService);

  readonly intentions: IntentionOption[] = [
    { value: 'Pedir', emoji: '🙏', label: 'Pedir' },
    { value: 'Ofrecer', emoji: '🤲', label: 'Ofrecer' },
    { value: 'Agradecer', emoji: '🙌', label: 'Agradecer' },
    { value: 'Bendecir', emoji: '✨', label: 'Bendecir' }
  ];

  // Estado del formulario para nueva vela
  newAuthor = signal<string>('');
  newIntention = signal<CandleIntention>('Pedir');
  newMessage = signal<string>('');

  // Filtro del muro
  activeFilter = signal<CandleIntention | 'Todas'>('Todas');

  candles = signal<CandleEntry[]>([]);
  candlesLoading = signal(true);
  candlesError = signal<string | null>(null);
  submitError = signal<string | null>(null);
  isSubmitting = signal(false);
  prayerError = signal<string | null>(null);
  pendingPrayers = signal<string[]>([]);

  private readonly prayerSubscriptions = new Map<string, Unsubscribe>();
  private prayerSubscriptionUserId: string | null = null;

  constructor() {
    const unsubscribe = onSnapshot(
      query(collection(firestoreDb, 'candles'), orderBy('createdAt', 'desc')),
      snapshot => {
        const prayerStates = new Map(this.candles().map(candle => [candle.id, candle.prayedByMe]));
        this.candles.set(snapshot.docs.map(document => {
          const candle = document.data({ serverTimestamps: 'estimate' }) as CandleDocument;
          return {
            id: document.id,
            author: candle.author,
            intention: candle.intention,
            message: candle.message,
            createdAt: this.formatCreatedAt(candle.createdAt),
            prayersCount: candle.prayersCount,
            prayedByMe: prayerStates.get(document.id) ?? false
          };
        }));
        this.candlesLoading.set(false);
        this.candlesError.set(null);
      },
      error => {
        console.error('Error al cargar las velas desde Firestore:', error);
        this.candlesLoading.set(false);
        this.candlesError.set('No se pudieron cargar las velas. Inténtalo de nuevo más tarde.');
      }
    );

    effect(() => {
      this.syncPrayerSubscriptions(this.authService.currentUser()?.uid ?? null);
    });

    inject(DestroyRef).onDestroy(() => {
      unsubscribe();
      this.prayerSubscriptions.forEach(stop => stop());
      this.prayerSubscriptions.clear();
    });
  }

  // Velas filtradas reactivamente
  filteredCandles = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'Todas') return this.candles();
    return this.candles().filter(c => c.intention === filter);
  });

  // Encender una nueva vela
  async lightCandle() {
    const user = this.authService.currentUser();
    const text = this.newMessage().trim();
    if (!user || !text || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);
    try {
      const candleRef = doc(collection(firestoreDb, 'candles'));
      const batch = writeBatch(firestoreDb);
      batch.set(candleRef, {
        author: this.newAuthor().trim() || 'Anónimo',
        intention: this.newIntention(),
        message: text,
        createdAt: serverTimestamp(),
        prayersCount: 1
      });
      batch.set(doc(candleRef, 'prayers', user.uid), {
        createdAt: serverTimestamp()
      });
      await batch.commit();

      this.newMessage.set('');
      this.newAuthor.set('');
    } catch (error) {
      console.error('Error al guardar la vela en Firestore:', error);
      if (error instanceof FirebaseError && error.code === 'permission-denied') {
        this.submitError.set('Firebase rechazó el guardado. Comprueba que las reglas de Firestore estén desplegadas y que tu sesión siga activa.');
      } else {
        const detail = error instanceof Error ? ` ${error.message}` : '';
        this.submitError.set(`No se pudo encender la vela. Inténtalo de nuevo.${detail}`);
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async joinPrayer(candleId: string) {
    const user = this.authService.currentUser();
    if (!user) {
      this.prayerError.set('Inicia sesión para unirte a la oración.');
      return;
    }
    if (this.pendingPrayers().includes(candleId)) return;

    this.prayerError.set(null);
    this.pendingPrayers.update(ids => [...ids, candleId]);
    try {
      const candleRef = doc(firestoreDb, 'candles', candleId);
      const prayerRef = doc(candleRef, 'prayers', user.uid);
      await runTransaction(firestoreDb, async transaction => {
        const [candleSnapshot, prayerSnapshot] = await Promise.all([
          transaction.get(candleRef),
          transaction.get(prayerRef)
        ]);

        if (!candleSnapshot.exists()) {
          throw new Error('La vela ya no existe.');
        }
        if (prayerSnapshot.exists()) return;

        const prayersCount = candleSnapshot.data()['prayersCount'];
        if (typeof prayersCount !== 'number' || !Number.isSafeInteger(prayersCount)) {
          throw new Error('El contador de oraciones no es válido.');
        }

        transaction.set(prayerRef, { createdAt: serverTimestamp() });
        transaction.update(candleRef, { prayersCount: prayersCount + 1 });
      });

      this.candles.update(list =>
        list.map(candle => candle.id === candleId
          ? { ...candle, prayedByMe: true }
          : candle)
      );
    } catch (error) {
      console.error('Error al unirse a la oración en Firestore:', error);
      this.prayerError.set(error instanceof FirebaseError && error.code === 'permission-denied'
        ? 'Firebase rechazó la operación. Comprueba que las reglas de Firestore estén desplegadas y que tu sesión siga activa.'
        : 'No se pudo registrar tu oración. Inténtalo de nuevo.');
    } finally {
      this.pendingPrayers.update(ids => ids.filter(id => id !== candleId));
    }
  }

  getEmoji(intention: CandleIntention): string {
    return this.intentions.find(i => i.value === intention)?.emoji ?? '🕯️';
  }

  private formatCreatedAt(timestamp: Timestamp): string {
    const minutesAgo = Math.floor((Date.now() - timestamp.toDate().getTime()) / 60_000);
    if (minutesAgo < 1) return 'Ahora mismo';
    if (minutesAgo < 60) return `Hace ${minutesAgo} min`;

    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return `Hace ${hoursAgo} ${hoursAgo === 1 ? 'hora' : 'horas'}`;

    const daysAgo = Math.floor(hoursAgo / 24);
    return `Hace ${daysAgo} ${daysAgo === 1 ? 'día' : 'días'}`;
  }

  private syncPrayerSubscriptions(userId: string | null): void {
    const candles = this.candles();
    const candleIds = new Set(candles.map(candle => candle.id));

    if (userId !== this.prayerSubscriptionUserId) {
      this.prayerSubscriptions.forEach(stop => stop());
      this.prayerSubscriptions.clear();
      this.prayerSubscriptionUserId = userId;
      if (candles.some(candle => candle.prayedByMe)) {
        this.candles.update(list => list.map(candle => ({ ...candle, prayedByMe: false })));
      }
    }

    for (const [candleId, stop] of this.prayerSubscriptions) {
      if (!candleIds.has(candleId)) {
        stop();
        this.prayerSubscriptions.delete(candleId);
      }
    }

    if (!userId) return;

    for (const candle of candles) {
      if (this.prayerSubscriptions.has(candle.id)) continue;

      const prayerRef = doc(firestoreDb, 'candles', candle.id, 'prayers', userId);
      const stop = onSnapshot(
        prayerRef,
        snapshot => this.candles.update(list =>
          list.map(entry => entry.id === candle.id
            ? { ...entry, prayedByMe: snapshot.exists() }
            : entry)
        ),
        error => {
          console.error('Error al comprobar la oración del usuario:', error);
          this.prayerError.set('No se pudo comprobar si ya te uniste a esta oración.');
        }
      );
      this.prayerSubscriptions.set(candle.id, stop);
    }
  }
}