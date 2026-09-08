import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  imports: [MatButtonModule, MatCardModule],
  selector: 'app-pray',
  styleUrl: './pray.scss',
  templateUrl: './pray.html',
})
export class Pray {}
