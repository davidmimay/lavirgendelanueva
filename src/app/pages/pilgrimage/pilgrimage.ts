import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { firestoreDb } from '../../core/firebase.config';

export interface FloralOffering {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
}

@Component({
  selector: 'app-pilgrimage',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './pilgrimage.html',
  styleUrl: './pilgrimage.scss'
})
export class Pilgrimage implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private snackBar = inject(MatSnackBar);
  private timerId?: ReturnType<typeof setInterval>;
  private offeringsUnsubscribe?: Unsubscribe;

  now = signal<Date>(new Date());
  offeringsLoading = signal(true);
  offeringsError = signal<string | null>(null);
  offeringsWarning = signal<string | null>(null);

  // Cálculo automático de la fecha del próximo Lunes de Pascua
  nextEasterMonday = computed(() => {
    const current = this.now();
    const year = current.getFullYear();
    let easterMonday = this.getEasterMondayForYear(year);

    // Si ya pasó el Lunes de Pascua de este año, calcular el del año siguiente
    if (current.getTime() > easterMonday.getTime() + 86400000) {
      easterMonday = this.getEasterMondayForYear(year + 1);
    }
    return easterMonday;
  });

  // Cuenta atrás en días, horas, minutos y segundos
  countdown = computed(() => {
    const diff = this.nextEasterMonday().getTime() - this.now().getTime();

    if (diff <= 0) {
      return { isToday: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      isToday: false,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  });

  // Mapa centrado en el entorno de la Ermita de la Virgen de la Nueva (Pantano de San Juan)
  mapUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12174.5!2d-4.3645!3d40.3712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd41a8e4c1b7e001%3A0x40340f3be4bc8c0!2sErmita%20de%20la%20Virgen%20de%20la%20Nueva!5e0!3m2!1ses!2ses!4v1700000000000'
  );

  offerings = signal<FloralOffering[]>([]);

  // Estado del pedido de ofrenda
  selectedOffering = signal<FloralOffering | null>(null);
  donorName = signal<string>('');
  ribbonDedication = signal<string>('');

  ngOnInit() {
    this.timerId = setInterval(() => this.now.set(new Date()), 1000);
    this.offeringsUnsubscribe = onSnapshot(
      collection(firestoreDb, 'bouquets'),
      snapshot => {
        let hasInvalidOffering = false;
        const offerings = snapshot.docs.flatMap(document => {
          const data = document.data();
          const name = data['name'];
          const description = data['description'];
          const price = data['price'];
          const image = data['image'];
          const tag = data['tag'];

          if (
            typeof name !== 'string' ||
            typeof description !== 'string' ||
            typeof price !== 'number' ||
            !Number.isFinite(price) ||
            typeof image !== 'string'
          ) {
            console.error(`El documento ${document.id} de "bouquets" tiene campos no válidos.`);
            hasInvalidOffering = true;
            return [];
          }

          return [{
            id: document.id,
            name,
            description,
            price,
            image,
            ...(typeof tag === 'string' ? { tag } : {})
          }];
        });

        this.offerings.set(offerings);
        this.offeringsLoading.set(false);
        this.offeringsError.set(null);
        this.offeringsWarning.set(hasInvalidOffering
          ? 'Algunos productos no se muestran porque sus datos no son válidos.'
          : null);
      },
      error => {
        console.error('Error al cargar los productos florales desde Firestore:', error);
        this.offeringsLoading.set(false);
        this.offeringsError.set('No se pudieron cargar los productos florales. Comprueba los permisos de Firestore e inténtalo de nuevo.');
      }
    );
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
    this.offeringsUnsubscribe?.();
  }

  selectForOrder(item: FloralOffering) {
    this.selectedOffering.set(item);
  }

  cancelOrder() {
    this.selectedOffering.set(null);
    this.donorName.set('');
    this.ribbonDedication.set('');
  }

  confirmOrder() {
    const item = this.selectedOffering();
    if (!item) return;

    this.snackBar.open(
      `Ofrenda "${item.name}" registrada. La Hermandad la depositará en el altar de la Virgen.`,
      'Entendido',
      { duration: 5000 }
    );
    this.cancelOrder();
  }

  // Algoritmo gregoriano (Meeus/Jones/Butcher) para calcular el Domingo de Resurrección y sumar 1 día
  private getEasterMondayForYear(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    // Domingo de Pascua + 1 día = Lunes de Pascua
    return new Date(year, month, day + 1, 0, 0, 0);
  }
}