import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NovenaService, Comun } from '../novena/novena.service';

@Component({
  selector: 'app-pray-dialog',
  styleUrls: ['./oracion-dialog.scss'],
  template: `
    <div *ngFor="let comun of comun">
      <h1 mat-dialog-title >Oracion</h1>
      <div mat-dialog-content>
        <p>{{comun.padreNuestro}}</p>
        <p>{{comun.aveMaria}}</p>
      </div>
        <div mat-dialog-actions>
          <button mat-button (click)="onNoClick()">Cancel</button>
        </div>
    </div>
  `
})

export class OracionDialogComponent {
  //comun:Comun[] = [];

  constructor(
    public dialogRef: MatDialogRef<OracionDialogComponent>,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  
}