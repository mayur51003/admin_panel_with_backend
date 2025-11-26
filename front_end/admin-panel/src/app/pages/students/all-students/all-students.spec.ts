import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllStudents } from './all-students';

describe('AllStudents', () => {
  let component: AllStudents;
  let fixture: ComponentFixture<AllStudents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllStudents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllStudents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
