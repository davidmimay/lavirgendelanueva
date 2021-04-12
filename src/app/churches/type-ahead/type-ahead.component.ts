import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'type-ahead',
  templateUrl: './type-ahead.component.html',
  styleUrls: ['./type-ahead.component.scss'],
})
export class TypeAheadComponent implements OnInit {
  results: Observable<any[]>;
  offset = new Subject<string>();
  churches;

  constructor(
    private db: AngularFirestore,
  ){}
 
  // Form event handler
  onkeyup(e) {
    this.offset.next(e.target.value.toLowerCase())
  }

  // Reactive search query
  search() {
    return this.offset.pipe(
      filter(val => !!val), // filter empty strings
      switchMap(offset => {
        return this.db.collection('churches', ref =>
          ref.orderBy(`searchableIndex.${offset}`).limit(5)
        )
        .valueChanges({ idField: 'id' }) // get idfield to use the id in routes
      })
    )
  }

  ngOnInit() {
    this.results = this.search();
  }
}