import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pray-dialog',
  styleUrls: ['./dialog.scss'],
  template: `
    <h1 mat-dialog-title>Pray</h1>
    <div mat-dialog-content>
    <p>What do you want?.</p>
      <mat-form-field>
        <input placeholder="ask" matInput [(ngModel)]="data.ask" />
      </mat-form-field>
    </div>

    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Cancel</button>
      <!-- <button mat-button color="accent" *ngIf="(payment.status === 'succeeded' | async)" [mat-dialog-close]="data.ask" cdkFocusInitial>LIGHT IF PAY</button> -->

      <!--
      <button mat-button [mat-dialog-close]="data.ask" cdkFocusInitial>
        Create
      </button>
      -->
    </div>
  `
})

export class PrayDialogComponent {
  
  constructor(
    public dialogRef: MatDialogRef<PrayDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {}
  
}