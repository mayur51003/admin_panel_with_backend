import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeOfConduct } from './code-of-conduct';

describe('CodeOfConduct', () => {
  let component: CodeOfConduct;
  let fixture: ComponentFixture<CodeOfConduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeOfConduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeOfConduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
