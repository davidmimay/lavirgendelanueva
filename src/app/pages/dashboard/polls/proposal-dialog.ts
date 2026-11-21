import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export interface ProposalDraft {
  title: string;
  description: string;
  closingDate: string;
  options: Record<string, { label: string; votes: number }>;
}

@Component({
  selector: 'app-proposal-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './proposal-dialog.html',
  styleUrl: './proposal-dialog.scss'
})
export class ProposalDialog {
  private readonly dialogRef = inject(MatDialogRef<ProposalDialog, ProposalDraft>);

  readonly title = signal('');
  readonly description = signal('');
  readonly closingDate = signal('');
  readonly optionLabels = signal<string[]>(['', '']);

  updateOption(index: number, label: string): void {
    this.optionLabels.update(options =>
      options.map((option, optionIndex) => optionIndex === index ? label : option)
    );
  }

  addOption(): void {
    if (this.optionLabels().length < 8) {
      this.optionLabels.update(options => [...options, '']);
    }
  }

  removeOption(index: number): void {
    if (this.optionLabels().length > 2) {
      this.optionLabels.update(options => options.filter((_, optionIndex) => optionIndex !== index));
    }
  }

  canSubmit(): boolean {
    const labels = this.optionLabels().map(option => option.trim());
    return !!this.title().trim()
      && !!this.description().trim()
      && !!this.closingDate()
      && labels.length >= 2
      && labels.every(Boolean)
      && new Set(labels.map(label => label.toLocaleLowerCase())).size === labels.length;
  }

  submit(): void {
    if (!this.canSubmit()) return;

    const options = Object.fromEntries(
      this.optionLabels().map((label, index) => [
        `option${index + 1}`,
        { label: label.trim(), votes: 0 }
      ])
    );
    this.dialogRef.close({
      title: this.title().trim(),
      description: this.description().trim(),
      closingDate: this.closingDate(),
      options
    });
  }
}
