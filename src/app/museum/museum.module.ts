import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MuseumRoutingModule } from './museum-routing.module';
import { InfoPageComponent } from './info-page/info-page.component';


@NgModule({
  declarations: [InfoPageComponent],
  imports: [
    CommonModule,
    MuseumRoutingModule,
    SharedModule,
  ]
})
export class MuseumModule { }
