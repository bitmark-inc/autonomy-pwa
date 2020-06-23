import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoiSearchComponent } from './poi-search.component';

describe('PoiSearchComponent', () => {
  let component: PoiSearchComponent;
  let fixture: ComponentFixture<PoiSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoiSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoiSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
