import { Component, OnInit } from '@angular/core';
import { Pray } from '../pray.model';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pray-page',
  templateUrl: './pray-page.component.html',
  styleUrls: ['./pray-page.component.scss']
})

export class PrayPageComponent implements OnInit {

  constructor(
    private db: AngularFirestore,
    private route: ActivatedRoute,
  ) {}

    praysCollection: AngularFirestoreCollection<Pray>;
    praysObservable: Observable<Pray[]>;
    churchId: string;

  ngOnInit() {
    this.churchId = this.route.snapshot.paramMap.get('id');
    // Step 1: Make a reference
    this.praysCollection = this.db.collection('prays', ref => ref.where('churchId', '==', this.churchId))
    // .orderBy('createdAt')) // not working yet

    // Step 2: Get an observable of the data
    this.praysObservable = this.praysCollection.valueChanges({ idField: 'id' }); // idfield to get prayId
  }
}