import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { PrayDialogComponent } from '../dialogs/pray-dialog.component';
import { ChurchService } from '../church.service';
import { Pray } from '../pray.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pray',
  templateUrl: './pray.component.html',
  styleUrls: ['./pray.component.scss']
})
export class PrayComponent implements OnInit {

  prays: Pray[]; // from board.model
  sub: Subscription; // from rxjs
  churchId: string;

  constructor(
    public churchService: ChurchService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    ) {}


  ngOnInit() {
  }

  // drop boards
  /*
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.prays, event.previousIndex, event.currentIndex);
    this.churchService.sortPrays(this.prays);
  }
  */
  // dialog new board
  openPrayDialog(): void {
    const dialogRef = this.dialog.open(PrayDialogComponent, {
      width: '400px',
      data: {  }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.churchService.createPray({
          ask: result,
          churchId: this.churchId = this.route.snapshot.paramMap.get('id'),
          // priority: this.prays.length
        });
      }
    });
  }
}