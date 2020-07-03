import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoveryKeyComponent } from './recovery-key.component';

describe('RecoveryKeyComponent', () => {
  let component: RecoveryKeyComponent;
  let fixture: ComponentFixture<RecoveryKeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecoveryKeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoveryKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
