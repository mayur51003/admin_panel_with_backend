import { TestBed } from '@angular/core/testing';

import { AboutCollegeService } from './about-college-service';

describe('AboutCollegeService', () => {
  let service: AboutCollegeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AboutCollegeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
