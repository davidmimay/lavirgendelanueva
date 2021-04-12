import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { SeoService } from '../../services/seo.service'; // 'src/app/services/seo.service'
import { ChurchService } from '../church.service';
import { Observable } from 'rxjs';
// import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-detail-page',
  templateUrl: './detail-page.component.html',
  styleUrls: ['./detail-page.component.scss']
})
export class DetailPageComponent implements OnInit {
  churchId: string;
  church: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    public data: ChurchService,
    private seo: SeoService,
    // private db: AngularFirestore,

  ) {}

  ngOnInit() {
    // get the church id
    this.churchId = this.route.snapshot.paramMap.get('id');
    // get data of church id
    this.church = this.data.getChurch(this.churchId)
      .pipe(
        tap(chur =>
          this.seo.generateTags({
            title: chur.name,
            description: chur.bio,
            image: chur.image,
          })
        )
      );
  }
}