import { Component, inject, signal } from '@angular/core';
import { NovenaService } from './novena.service';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Dialog } from '../../../shared/dialog/dialog';

@Component({
  imports: [
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatExpansionModule,
    MatDialogModule,
    MatButtonModule
  ],
  standalone: true,
  selector: 'app-novena',
  styleUrl: './novena.scss',
  templateUrl: './novena.html',
})
export class Novena {
  private readonly novenaService = inject(NovenaService);
  private readonly dialog = inject(MatDialog);

  readonly novena = this.novenaService.novena;
  diaSeleccionado = signal<number>(1);

  seleccionarDia(numDia: number) {
    this.diaSeleccionado.set(numDia);
  }

  openDialog(title: string, content: string) {
    this.dialog.open(Dialog, {
      width: '450px',
      data: {
        title,
        content,
      }
    });
  }

  // Text Personalization
  fontSize = signal(1);
  lineHeight = signal(1.6);
}
