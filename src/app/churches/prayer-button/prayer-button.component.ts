import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { ChurchService } from '../church.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Pray, Prayer } from '../pray.model';
import { AngularFireAuth } from '@angular/fire/auth';


@Component({
  selector: 'app-prayer-button',
  templateUrl: './prayer-button.component.html',
  styleUrls: ['./prayer-button.component.scss']
})
export class PrayerButtonComponent implements OnInit {

  prayId: string;
  userId: string;
  currentUser = null;
  prayers: Observable<any>;
  avgRating: Observable<any>;

  constructor(
    private db: AngularFirestore,
    private route: ActivatedRoute,
    public churchService: ChurchService,
    private afAuth: AngularFireAuth,

    ) { }

  ngOnInit() {
   /* this.afAuth.authState.subscribe(userId => { this.currentUser = userId });

    this.prayers = this.churchService.getPrayPrayers(this.prayId)

    this.avgRating = this.prayers.pipe(map(arr => {
      const ratings = arr.map(v => v.prayed)
      return ratings.length ? ratings.reduce((total, val) => total + val) / arr.length : 'not reviewed'
    }))
  }

  prayerHandler(prayed) {
    this.churchService.setPrayer(this.userId, this.prayId, prayed)*/
  }

}