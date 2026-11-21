import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export type AnnouncementTag = 'Cabildo' | 'Cultos' | 'Obra Social' | 'Aviso';

export interface AnnouncementDraft {
  title: string;
  summary: string;
  tag: AnnouncementTag;
}

@Component({
  selector: 'app-announcement-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './announcement-dialog.html',
  styleUrl: './announcement-dialog.scss'
})
export class AnnouncementDialog {
  private readonly dialogRef = inject(MatDialogRef<AnnouncementDialog, AnnouncementDraft>);

  readonly title = signal('');
  readonly summary = signal('');
  readonly tag = signal<AnnouncementTag>('Aviso');

  canSubmit(): boolean {
    return !!this.title().trim() && !!this.summary().trim();
  }

  submit(): void {
    if (!this.canSubmit()) return;

    this.dialogRef.close({
      title: this.title().trim(),
      summary: this.summary().trim(),
      tag: this.tag()
    });
  }
}
