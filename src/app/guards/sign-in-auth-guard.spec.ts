import { TestBed } from '@angular/core/testing';

import { SignInAuthGuard } from './sign-in-auth-guard';

describe('SignInAuthGuard', () => {
  let guard: SignInAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SignInAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
