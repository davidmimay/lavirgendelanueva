import { Component, DestroyRef, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestoreDb } from '../../core/firebase.config';

interface Prayer {
  id: string;
  title: string;
  content: string;
}

@Component({
  imports: [MatButtonModule, MatCardModule, RouterLink],
  selector: 'app-pray',
  styleUrl: './pray.scss',
  templateUrl: './pray.html',
})
export class Pray {
  prayers = signal<Prayer[]>([]);
  prayersLoading = signal(true);
  prayersError = signal<string | null>(null);
  prayersWarning = signal<string | null>(null);

  constructor() {
    const unsubscribe = onSnapshot(
      collection(firestoreDb, 'prayers'),
      snapshot => {
        let hasInvalidPrayer = false;
        const prayers = snapshot.docs.flatMap(document => {
          const data = document.data();
          const title = data['title'] ?? data['titulo'];
          const content = data['content'] ?? data['contenido'];

          if (typeof title !== 'string' || typeof content !== 'string') {
            console.error(`El documento ${document.id} de "prayers" no tiene título y contenido válidos.`);
            hasInvalidPrayer = true;
            return [];
          }

          return [{ id: document.id, title, content }];
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

    inject(DestroyRef).onDestroy(unsubscribe);
  }
}