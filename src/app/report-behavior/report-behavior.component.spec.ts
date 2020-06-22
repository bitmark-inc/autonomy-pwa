import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBehaviorComponent } from './report-behavior.component';

describe('ReportBehaviorComponent', () => {
  let component: ReportBehaviorComponent;
  let fixture: ComponentFixture<ReportBehaviorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportBehaviorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportBehaviorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
