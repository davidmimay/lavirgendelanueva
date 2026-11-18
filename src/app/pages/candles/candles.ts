import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

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
    MatDividerModule
  ],
  templateUrl: './candles.html',
  styleUrl: './candles.scss'
})
export class Candles {
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

  // Lista inicial de velas (conectable a Firestore)
  candles = signal<CandleEntry[]>([
    {
      id: 'c1',
      author: 'María Elena G.',
      intention: 'Pedir',
      message: 'Virgen de la Nueva, te pido por la pronta recuperación de mi padre y por la salud de toda nuestra familia.',
      createdAt: 'Hace 12 min',
      prayersCount: 14
    },
    {
      id: 'c2',
      author: 'Anónimo',
      intention: 'Agradecer',
      message: 'Gracias Madre por acompañarnos este año y concedernos la paz en nuestro hogar.',
      createdAt: 'Hace 45 min',
      prayersCount: 23
    },
    {
      id: 'c3',
      author: 'Familia Martínez',
      intention: 'Bendecir',
      message: 'Bendice a nuestros hijos en este nuevo curso y guía siempre sus pasos.',
      createdAt: 'Hace 2 horas',
      prayersCount: 9
    },
    {
      id: 'c4',
      author: 'José Antonio',
      intention: 'Ofrecer',
      message: 'Te ofrezco mi trabajo diario y mis esfuerzos por los más necesitados de nuestra parroquia.',
      createdAt: 'Hace 3 horas',
      prayersCount: 17
    }
  ]);

  // Velas filtradas reactivamente
  filteredCandles = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'Todas') return this.candles();
    return this.candles().filter(c => c.intention === filter);
  });

  // Encender una nueva vela y añadirla al principio del muro
  lightCandle() {
    const text = this.newMessage().trim();
    if (!text) return;

    const newEntry: CandleEntry = {
      id: crypto.randomUUID(),
      author: this.newAuthor().trim() || 'Anónimo',
      intention: this.newIntention(),
      message: text,
      createdAt: 'Ahora mismo',
      prayersCount: 1,
      prayedByMe: true
    };

    this.candles.update(list => [newEntry, ...list]);

    // Limpiar el formulario tras encender
    this.newMessage.set('');
    this.newAuthor.set('');
  }

  // Sumar una oración a la vela de otra persona
  joinPrayer(candleId: string) {
    this.candles.update(list =>
      list.map(c => {
        if (c.id !== candleId || c.prayedByMe) return c;
        return {
          ...c,
          prayersCount: c.prayersCount + 1,
          prayedByMe: true
        };
      })
    );
  }

  getEmoji(intention: CandleIntention): string {
    return this.intentions.find(i => i.value === intention)?.emoji ?? '🕯️';
  }
}