import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSymptomComponent } from './report-symptom.component';

describe('ReportSymptomComponent', () => {
  let component: ReportSymptomComponent;
  let fixture: ComponentFixture<ReportSymptomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportSymptomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSymptomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
