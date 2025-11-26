import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutCollege } from './about-college';

describe('AboutCollage', () => {
  let component: AboutCollege;
  let fixture: ComponentFixture<AboutCollege>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutCollege],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutCollege);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
