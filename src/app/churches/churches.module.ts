import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChurchesRoutingModule } from './churches-routing.module';
import { ListPageComponent } from './list-page/list-page.component';
import { DetailPageComponent } from './detail-page/detail-page.component';
import { PrayPageComponent } from './pray-page/pray-page.component';
import { SharedModule } from '../shared/shared.module';
import { PrayComponent } from './pray/pray.component';
import { MatDialogModule } from '@angular/material/dialog';
import { PrayDialogComponent } from './dialogs/pray-dialog.component';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { PrayerButtonComponent } from './prayer-button/prayer-button.component';
import { TypeAheadComponent } from './type-ahead/type-ahead.component';

@NgModule({
  declarations: [
    ListPageComponent,
    DetailPageComponent,
    PrayPageComponent,
    PrayComponent,
    PrayDialogComponent,
    PrayerButtonComponent,
    TypeAheadComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ChurchesRoutingModule,
    MatDialogModule,
    FormsModule,
    MatButtonToggleModule,
  ],
  entryComponents: [PrayDialogComponent],

})
export class ChurchesModule { }
