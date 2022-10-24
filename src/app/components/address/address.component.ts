import { Component, Input, OnInit } from '@angular/core';
import { AddressService } from '@app/services/address.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
})
export class AddressComponent implements OnInit {
  @Input() address: any = {};

  constructor(
    public addressService: AddressService,
  ) {
  }

  ngOnInit() {
  }

}
