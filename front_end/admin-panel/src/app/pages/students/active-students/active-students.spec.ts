import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveStudents } from './active-students';

describe('ActiveStudents', () => {
  let component: ActiveStudents;
  let fixture: ComponentFixture<ActiveStudents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveStudents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveStudents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
