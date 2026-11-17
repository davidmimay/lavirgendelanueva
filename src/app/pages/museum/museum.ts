import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

export interface MuseumPiece {
  id: string;
  title: string;
  subtitle: string;
  category: 'Orfebrería' | 'Textil' | 'Escultura' | 'Documento';
  year: string;
  author?: string;
  imageUrl: string;
  description: string;
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
  private dialog = inject(MatDialog);

  // Categoría activa para el filtro
  selectedCategory = signal<string>('Todas');
  readonly categories = ['Todas', 'Orfebrería', 'Textil', 'Escultura', 'Documento'];

  // Datos de ejemplo (sustituibles por tu servicio o Firebase)
  pieces = signal<MuseumPiece[]>([
    {
      id: '1',
      title: 'Corona de Procesión',
      subtitle: 'Plata sobredorada y pedrería',
      category: 'Orfebrería',
      year: 'Siglo XVIII',
      author: 'Taller valenciano',
      imageUrl: 'assets/museum/corona.jpg',
      description: 'Pieza labrada a mano con motivos vegetales y celestiales, utilizada en las festividades mayores.'
    },
    {
      id: '2',
      title: 'Manto de Gala Bordado',
      subtitle: 'Terciopelo de seda e hilo de oro',
      category: 'Textil',
      year: '1894',
      author: 'Obrador local',
      imageUrl: 'assets/museum/manto.jpg',
      description: 'Manto ceremonial confeccionado mediante técnica de realce sobre bastidor tradicional.'
    },
    {
      id: '3',
      title: 'Bula Fundacional',
      subtitle: 'Pergamino manuscrito con sello de cera',
      category: 'Documento',
      year: '1642',
      imageUrl: 'assets/museum/documento.jpg',
      description: 'Documento histórico original que acredita los privilegios y el inicio de la devoción.'
    }
  ]);

  // Lista filtrada reactivamente
  filteredPieces = computed(() => {
    const category = this.selectedCategory();
    if (category === 'Todas') return this.pieces();
    return this.pieces().filter(p => p.category === category);
  });

  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }
}