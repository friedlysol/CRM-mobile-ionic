import { Component, OnInit } from '@angular/core';
import { SupplyInterface } from '@app/interfaces/supply.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { TypeService } from '@app/services/type.service';
import { AlertController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-supplies-request-list',
  templateUrl: './supplies-request-list.page.html',
  styleUrls: ['./supplies-request-list.page.scss'],
})
export class SuppliesRequestListPage implements OnInit {
  requests: SupplyInterface[] = [];
  statuses: TypeInterface[] = [];

  constructor(
    private typeService: TypeService,
  ) { }

  async ngOnInit() {
    this.statuses = await this.typeService.getByType('supplies_request_status');
    console.log(this.statuses)
  }
}
