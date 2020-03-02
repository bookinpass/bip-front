import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseFlightDialogComponent } from './choose-flight-dialog.component';

describe('ChooseFlightDialogComponent', () => {
  let component: ChooseFlightDialogComponent;
  let fixture: ComponentFixture<ChooseFlightDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseFlightDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseFlightDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
