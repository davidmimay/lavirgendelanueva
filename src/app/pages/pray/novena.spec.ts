import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Novena } from './novena';

describe('Novena', () => {
  let component: Novena;
  let fixture: ComponentFixture<Novena>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Novena],
    }).compileComponents();

    fixture = TestBed.createComponent(Novena);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
