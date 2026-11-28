import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export interface PrayerDraft {
  title: string;
  content: string;
  image?: File;
}

@Component({
  selector: 'app-pray-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './pray-dialog.html',
  styleUrl: './pray-dialog.scss'
})
export class PrayDialog {
  private readonly dialogRef = inject(MatDialogRef<PrayDialog, PrayerDraft>);

  readonly title = signal('');
  readonly content = signal('');
  readonly image = signal<File | null>(null);
  readonly imageError = signal<string | null>(null);

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
      && !!this.content().trim()
      && !this.imageError();
  }

  submit(): void {
    if (!this.canSubmit()) return;

    const image = this.image();
    this.dialogRef.close({
      title: this.title().trim(),
      content: this.content().trim(),
      ...(image ? { image } : {})
    });
  }
}
