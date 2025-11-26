import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveStudents } from './inactive-students';

describe('InactiveStudents', () => {
  let component: InactiveStudents;
  let fixture: ComponentFixture<InactiveStudents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveStudents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveStudents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
