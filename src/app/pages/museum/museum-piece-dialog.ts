import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import type { MuseumCategory } from './museum';

export interface MuseumPieceDraft {
  title: string;
  subtitle: string;
  category: MuseumCategory;
  year: string;
  patron: string;
  description: string;
  image: File | null;
}

function isMuseumCategory(value: string): value is MuseumCategory {
  return value === 'Orfebrería' || value === 'Textil' || value === 'Escultura' || value === 'Documento';
}

@Component({
  selector: 'app-museum-piece-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './museum-piece-dialog.html',
  styleUrl: './museum-piece-dialog.scss'
})
export class MuseumPieceDialog {
  private readonly dialogRef = inject(MatDialogRef<MuseumPieceDialog, MuseumPieceDraft>);

  readonly title = signal('');
  readonly subtitle = signal('');
  readonly category = signal<MuseumCategory>('Documento');
  readonly year = signal('');
  readonly patron = signal('');
  readonly description = signal('');
  readonly image = signal<File | null>(null);
  readonly imageError = signal<string | null>(null);

  selectCategory(value: string): void {
    if (isMuseumCategory(value)) this.category.set(value);
  }

  selectImage(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;

    const file = input.files?.[0] ?? null;
    this.imageError.set(null);
    if (file && !file.type.startsWith('image/')) {
      this.image.set(null);
      this.imageError.set('Selecciona un archivo de imagen válido.');
      input.value = '';
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      this.image.set(null);
      this.imageError.set('La imagen no puede superar los 5 MB.');
      input.value = '';
      return;
    }
    this.image.set(file);
  }

  canSubmit(): boolean {
    return !!this.title().trim()
      && !!this.subtitle().trim()
      && !!this.year().trim()
      && !!this.description().trim()
      && !this.imageError();
  }

  submit(): void {
    const image = this.image();
    if (!this.canSubmit()) return;

    this.dialogRef.close({
      title: this.title().trim(),
      subtitle: this.subtitle().trim(),
      category: this.category(),
      year: this.year().trim(),
      patron: this.patron().trim(),
      description: this.description().trim(),
      image
    });
  }
}
