import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityDataComponent } from './community-data.component';

describe('CommunityDataComponent', () => {
  let component: CommunityDataComponent;
  let fixture: ComponentFixture<CommunityDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
