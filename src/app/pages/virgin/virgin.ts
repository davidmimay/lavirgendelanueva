import { Component, computed, inject, OnDestroy, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-virgin',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTabsModule
  ],
  // Permite usar la etiqueta personalizada <model-viewer> sin errores de compilación
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './virgin.html',
  styleUrl: './virgin.scss'
})
export class Virgin implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private timerId?: ReturnType<typeof setInterval>;

  // Señal con la fecha y hora actual que se actualiza cada segundo
  now = signal<Date>(new Date());

  // Cálculo reactivo de la fecha objetivo (próximo 8 de septiembre)
  targetDate = computed(() => {
    const current = this.now();
    const currentYear = current.getFullYear();
    // Mes 8 en JavaScript es Septiembre (0 = Enero, 8 = Septiembre)
    let nextSep8 = new Date(currentYear, 8, 8, 0, 0, 0);

    // Si hoy ya es 9 de septiembre o posterior, apuntar al año siguiente
    if (current.getTime() > nextSep8.getTime() + 86400000) {
      nextSep8 = new Date(currentYear + 1, 8, 8, 0, 0, 0);
    }
    return nextSep8;
  });

  // Desglose de días, horas, minutos y segundos restantes
  countdown = computed(() => {
    const diff = this.targetDate().getTime() - this.now().getTime();

    if (diff <= 0) {
      return { isToday: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { isToday: false, days, hours, minutes, seconds };
  });

  // URL segura para el mapa de la procesión (Google My Maps o Google Maps Embed)
  mapUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3043.8!2d-4.398!3d40.362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDIxJzQzLjIiTiA0wrAyMyczMi44Ilc!5e0!3m2!1ses!2ses!4v1700000000000'
  );

  ngOnInit() {
    this.timerId = setInterval(() => {
      this.now.set(new Date());
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}