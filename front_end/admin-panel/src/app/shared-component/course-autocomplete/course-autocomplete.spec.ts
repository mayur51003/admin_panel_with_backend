import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseAutocomplete } from './course-autocomplete';

describe('CourseAutocomplete', () => {
  let component: CourseAutocomplete;
  let fixture: ComponentFixture<CourseAutocomplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseAutocomplete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseAutocomplete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
