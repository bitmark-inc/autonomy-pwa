import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcesAddingComponent } from './resources-adding.component';

describe('ResourcesAddingComponent', () => {
  let component: ResourcesAddingComponent;
  let fixture: ComponentFixture<ResourcesAddingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourcesAddingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourcesAddingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
