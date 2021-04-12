import { Component, OnInit } from '@angular/core';
import { NovenaService, Comun, Concreta } from './novena.service';

@Component({
  selector: 'novena-app',
  templateUrl: './novena.component.html',
  styleUrls: ['./novena.component.scss']
})
export class NovenaComponent implements OnInit {
  comun:Comun[] = [];
  concreta:Concreta[] = [];

  constructor( 
    private _novenaService: NovenaService,
    ){
    console.log("constructor");
  }

  ngOnInit(): void {
    this.comun = this._novenaService.getComun();
    this.concreta = this._novenaService.getConcreta();

    console.log(this.comun);
    console.log(this.concreta);
  }

}
