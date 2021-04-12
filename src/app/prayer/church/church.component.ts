import { Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AskDialogComponent } from '../dialogs/ask-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ChurchService } from '../church.service';
import { Ask } from '../church.model';

@Component({
  selector: 'app-church',
  templateUrl: './church.component.html',
  styleUrls: ['./church.component.scss']
})
export class ChurchComponent {
  @Input() church;

  askDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.church.asks, event.previousIndex, event.currentIndex);
    this.churchService.updateAsks(this.church.id, this.church.asks);
  }
  // dialog to create new ask
  openDialog(ask?: Ask, idx?: number): void {
    const newAsk = { label: 'purple' };
    const dialogRef = this.dialog.open(AskDialogComponent, {
      width: '500px',
      data: ask
        ? { ask: { ...ask }, isNew: false, churchId: this.church.id, idx }
        : { ask: newAsk, isNew: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.isNew) {
          this.churchService.updateAsks(this.church.id, [
            ...this.church.asks,
            result.ask
          ]);
        } else {
          const update = this.church.asks;
          update.splice(result.idx, 1, result.ask);
          this.churchService.updateAsks(this.church.id, this.church.asks);
        }
      }
    });
  }
  //delete church button
  handleDelete() {
    this.churchService.deleteChurch(this.church.id); //from church.service
  }

  constructor(private churchService: ChurchService, private dialog: MatDialog) {}
}
