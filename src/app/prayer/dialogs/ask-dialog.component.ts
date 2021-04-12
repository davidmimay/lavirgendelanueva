import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChurchService } from '../church.service';

@Component({
  selector: 'app-ask-dialog',
  styleUrls: ['./dialog.scss'],
  template: `
    <h1 mat-dialog-title>Ask</h1>
    <div mat-dialog-content class="content">
      <mat-form-field>
        <textarea
          placeholder="Ask description"
          matInput
          [(ngModel)]="data.ask.description"
        ></textarea>
      </mat-form-field>
      <br />
      <mat-button-toggle-group
        #group="matButtonToggleGroup"
        [(ngModel)]="data.ask.label"
      >
        <mat-button-toggle *ngFor="let opt of labelOptions" [value]="opt">
          <mat-icon [ngClass]="opt">{{
            opt === 'gray' ? 'check_circle' : 'lens'
          }}</mat-icon>
        </mat-button-toggle>
      </mat-button-toggle-group>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="data" cdkFocusInitial>
        {{ data.isNew ? 'Add Ask' : 'Update Ask' }}
      </button>

      <app-delete-button
        (delete)="handleAskDelete()"
        *ngIf="!data.isNew"
      ></app-delete-button>
    </div>
  `
})
export class AskDialogComponent {
  labelOptions = ['purple', 'blue', 'green', 'yellow', 'red', 'gray'];

  constructor(
    public dialogRef: MatDialogRef<AskDialogComponent>,
    private churchService: ChurchService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  handleAskDelete() {
    this.churchService.removeAsk(this.data.churchId, this.data.ask);
    this.dialogRef.close();
  }
}
