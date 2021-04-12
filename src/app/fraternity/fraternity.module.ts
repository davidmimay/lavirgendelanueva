import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FraternityRoutingModule } from './fraternity-routing.module';
import { MemberComponent } from './member/member.component';
import { SharedModule } from '../shared/shared.module';
import { NovenaComponent } from './novena/novena.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { SmallComponent } from './small/small.component';
import { BigComponent } from './big/big.component';

@NgModule({
  declarations: [
    MemberComponent,
    NovenaComponent,
    SubscriptionComponent,
    SmallComponent,
    BigComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FraternityRoutingModule,
  ]
})
export class FraternityModule { }