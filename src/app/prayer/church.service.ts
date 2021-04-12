import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { switchMap, map } from 'rxjs/operators';
import { Church, Ask } from './church.model';

@Injectable({
  providedIn: 'root'
})
export class ChurchService {
  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore) {}

  // Creates a new church for the current user
  async createChurch(data: Church) {
    const user = await this.afAuth.auth.currentUser;
    return this.db.collection('churches').add({
      ...data,
      uid: user.uid,
      asks: [{ description: 'Hello!', label: 'yellow' }]
    });
  }

  // Get all churches owned by current user
  getUserChurches() {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.db
            .collection<Church>('churches', ref =>
              ref.where('uid', '==', user.uid).orderBy('priority')
            )
            .valueChanges({ idField: 'id' });
        } else {
          return [];
        }
      }),
      // map(churches => churches.sort((a, b) => a.priority - b.priority))
    );
  }

  // Run a batch write to change the priority of each church for sorting
  sortChurches(churches: Church[]) {
    const db = firebase.firestore();
    const batch = db.batch();
    const refs = churches.map(b => db.collection('churches').doc(b.id));
    refs.forEach((ref, idx) => batch.update(ref, { priority: idx }));
    batch.commit();
  }

  // Delete church
  deleteChurch(churchId: string) {
    return this.db
      .collection('churches')
      .doc(churchId)
      .delete();
  }

  // Updates the asks on church
  updateAsks(churchId: string, asks: Ask[]) {
    return this.db
      .collection('churches')
      .doc(churchId)
      .update({ asks });
  }

  // Remove a specifc ask from the church
  removeAsk(churchId: string, ask: Ask) {
    return this.db
      .collection('churches')
      .doc(churchId)
      .update({
        asks: firebase.firestore.FieldValue.arrayRemove(ask)
      });
  }
}
