import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatButtonModule, MatCardModule, RouterLink],
  selector: 'app-pray',
  styleUrl: './pray.scss',
  templateUrl: './pray.html',
})
export class Pray {}