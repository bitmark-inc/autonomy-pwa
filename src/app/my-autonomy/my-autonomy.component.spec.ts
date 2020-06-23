import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAutonomyComponent } from './my-autonomy.component';

describe('MyAutonomyComponent', () => {
  let component: MyAutonomyComponent;
  let fixture: ComponentFixture<MyAutonomyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyAutonomyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAutonomyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
