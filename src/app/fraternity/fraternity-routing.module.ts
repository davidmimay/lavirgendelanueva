import { BigComponent } from './big/big.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MemberComponent } from './member/member.component';
import { NovenaComponent } from './novena/novena.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { SmallComponent } from './small/small.component';

const routes: Routes = [
  { path: '', component: BigComponent },
  { path: 'member', component: MemberComponent },
  { path: 'novena', component: NovenaComponent },
  { path: 'subscription', component: SubscriptionComponent },
  { path: 'small', component: SmallComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FraternityRoutingModule { }
