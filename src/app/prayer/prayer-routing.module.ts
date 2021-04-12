import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChurchesListComponent } from './churches-list/churches-list.component';


const routes: Routes = [
  { path: '', component: ChurchesListComponent },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrayerRoutingModule { }