import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DialogData } from './dialog.model';

@Component({
  imports: [MatDialogModule, MatButtonModule],
  standalone: true,
  selector: 'app-dialog',
  styleUrl: './dialog.scss',
  templateUrl: './dialog.html',
})
export class Dialog {
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
}
