import { TestBed } from '@angular/core/testing';
import { AddressService } from '@app/services/address.service';

describe('AddressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AddressService = TestBed.get(AddressService);
    expect(service).toBeTruthy();
  });
});
