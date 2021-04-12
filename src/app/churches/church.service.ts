import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { of, Observable } from 'rxjs';
import { Pray } from './pray.model';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChurchService {
  churches = null;
  subscription;
  prays = null;

  // list-page: subscribe to db
  subscribeToChurches() {
    if (!this.churches) {
      this.subscription = this.db.collection('churches').valueChanges({idField: 'id'})
      .subscribe(churches =>  {
        this.churches = churches;
      });
    }
  }
  // detail-page: Get church id from db churches
  getChurch(id: string) {
    if (this.churches) {
      const cached = this.churches.find(v => v.id === id);
      console.log('use cached');
      return of(cached);
    } else {
      console.log('use db');
      return this.db.collection('churches').doc(id).valueChanges();
    }
  }

  dispose() {
    this.subscription.unsubscribe();
    this.churches = null;
  }

  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    ) {}


  /**************** NEW ******************/

  // Creates a new pray for the current user
  async createPray(data: Pray) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp;
    const user = await this.afAuth.auth.currentUser;
    return this.db.collection('prays').add({
      ...data,
      userId: user.uid,
      createdAt: timestamp(),
      // tasks: [{ description: 'Hello!', label: 'yellow' }]
    });
  }
/*
  // get prays from church
  getChurchPrays(): Observable<any>{
    return this.db.collection('prays', ref => ref.where('churchId', '==', '6JNhG0gWLDDdvKD2rDXE'))
    .get()
  }

  // list-page: subscribe to db
  subscribeToPrays() {
    if (!this.prays) {
      this.subscription = this.db.collection('prays').valueChanges({idField: 'id'})
      .subscribe(prays =>  {
        this.prays = prays;
      });
    }
  }*/
  // Get all boards owned by current user
  getChurchPrays() {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.db
            .collection<Pray>('prays', ref =>
              ref.where('churchId', '==', this.prays.churchId)
              // .orderBy('createdAt')
            )
            .valueChanges({ idField: 'id' });
        } else {
          return [];
        }
      }),
      // map(boards => boards.sort((a, b) => a.priority - b.priority))
    );
  }
}