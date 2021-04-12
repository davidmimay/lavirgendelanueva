import { Component, OnInit, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChurchDialogComponent } from '../dialogs/church-dialog.component';
import { Church } from '../church.model';
import { ChurchService } from '../church.service';

@Component({
  selector: 'app-churches-list',
  templateUrl: './churches-list.component.html',
  styleUrls: ['./churches-list.component.scss']
})
export class ChurchesListComponent implements OnInit, OnDestroy {

  churches: Church[]; //from church.model
  sub: Subscription; //from rxjs

  constructor(public churchService: ChurchService, public dialog: MatDialog) {}

  ngOnInit() {
    this.sub = this.churchService
      .getUserChurches()
      .subscribe(churches => (this.churches = churches));
  }
  //drop churches
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.churches, event.previousIndex, event.currentIndex);
    this.churchService.sortChurches(this.churches);
  }
  //dialog new church
  openChurchDialog(): void {
    const dialogRef = this.dialog.open(ChurchDialogComponent, {
      width: '400px',
      data: {  }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.churchService.createChurch({
          title: result,
          priority: this.churches.length
        });
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
