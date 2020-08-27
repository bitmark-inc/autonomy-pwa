import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomSheetAlertComponent } from './bottom-sheet-alert.component';

describe('BottomSheetAlertComponent', () => {
  let component: BottomSheetAlertComponent;
  let fixture: ComponentFixture<BottomSheetAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BottomSheetAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BottomSheetAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
