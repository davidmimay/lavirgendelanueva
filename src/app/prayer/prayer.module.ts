import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrayerRoutingModule } from './prayer-routing.module';
import { ChurchesListComponent } from './churches-list/churches-list.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { ChurchComponent } from './church/church.component';
import { FormsModule } from '@angular/forms';
import { ChurchDialogComponent } from './dialogs/church-dialog.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AskDialogComponent } from './dialogs/ask-dialog.component';

@NgModule({
  declarations: [
    ChurchesListComponent,
    ChurchComponent,
    ChurchDialogComponent,
    AskDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    PrayerRoutingModule,
    FormsModule,
    DragDropModule,
    MatDialogModule,
    MatButtonToggleModule,
  ],
  entryComponents: [ChurchDialogComponent, AskDialogComponent]
})
export class PrayerModule {}
