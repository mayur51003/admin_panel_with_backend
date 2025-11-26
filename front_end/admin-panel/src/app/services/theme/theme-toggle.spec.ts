import { TestBed } from '@angular/core/testing';

import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  let service: ThemeToggle;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeToggle);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
