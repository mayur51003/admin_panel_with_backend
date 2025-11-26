import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Departments } from './departments';

describe('Analytics', () => {
  let component: Departments;
  let fixture: ComponentFixture<Departments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Departments],
    }).compileComponents();

    fixture = TestBed.createComponent(Departments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
