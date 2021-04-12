import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { AuthGuard } from './user/auth.guard';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  {
    path: 'login',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  },
  {
    path: 'kanban',
    loadChildren: () =>
      import('./kanban/kanban.module').then(m => m.KanbanModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'prayer',
    loadChildren: () =>
      import('./prayer/prayer.module').then(m => m.PrayerModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('./customers/customers.module').then(m => m.CustomersModule)
  },
  {
    path: 'churches',
    loadChildren: () =>
      import('./churches/churches.module').then(m => m.ChurchesModule),
      // canActivate: [AuthGuard] 
  },
  {
    path: 'virgin',
    loadChildren: () =>
      import('./virgin/virgin.module').then(m => m.VirginModule),
      // canActivate: [AuthGuard] 
  },
  {
    path: 'fraternity',
    loadChildren: () =>
      import('./fraternity/fraternity.module').then(m => m.FraternityModule),
    // canActivate: [AuthGuard]
  },
  { path: 'museum',
    loadChildren: () =>
      import('./museum/museum.module').then(m => m.MuseumModule)
  },
  { path: 'shop',
    loadChildren: () =>
      import('./shop/shop.module').then(m => m.ShopModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
})],
  exports: [RouterModule]
})
export class AppRoutingModule {}