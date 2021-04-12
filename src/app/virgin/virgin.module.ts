import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VirginRoutingModule } from './virgin-routing.module';
import { MainPageComponent } from './main-page/main-page.component';


@NgModule({
  declarations: [MainPageComponent],
  imports: [
    CommonModule,
    VirginRoutingModule,
    SharedModule
  ]
})
export class VirginModule { }
