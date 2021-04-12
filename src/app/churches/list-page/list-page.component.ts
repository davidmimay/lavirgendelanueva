import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';// 'src/app/services/seo.service'
import { AngularFirestore } from '@angular/fire/firestore';
import { ChurchService } from '../church.service';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.scss']
})
export class ListPageComponent implements OnInit {
  churches;

  constructor(
    private seo: SeoService,
    private db: AngularFirestore,
    public data: ChurchService,
    ) {}

  ngOnInit() {
    // seo performance
    this.seo.generateTags({
      title: 'Church List',
      description: 'A list filled with churches'
    });
    // 1-reference its location .collection, 2-request an observable .valueChanges
    this.churches = this.db.collection('churches').valueChanges({ idField: 'id' });
    // 3-subscribe
    this.data.subscribeToChurches();
  }

}