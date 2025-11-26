import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalsDesk } from './principals-desk';

describe('PrincipalsDesk', () => {
  let component: PrincipalsDesk;
  let fixture: ComponentFixture<PrincipalsDesk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalsDesk]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalsDesk);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
