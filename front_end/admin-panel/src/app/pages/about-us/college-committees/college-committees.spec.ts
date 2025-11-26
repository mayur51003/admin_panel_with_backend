import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollegeCommittees } from './college-committees';

describe('CollageCommittees', () => {
  let component: CollegeCommittees;
  let fixture: ComponentFixture<CollegeCommittees>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollegeCommittees],
    }).compileComponents();

    fixture = TestBed.createComponent(CollegeCommittees);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
