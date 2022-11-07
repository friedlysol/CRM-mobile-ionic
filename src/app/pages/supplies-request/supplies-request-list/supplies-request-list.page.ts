import { Component, OnInit } from '@angular/core';
import { SupplyInterface } from '@app/interfaces/supply.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { SupplyDatabase } from '@app/services/database/supply.database';
import { SupplyService } from '@app/services/supply.service';
import { TypeService } from '@app/services/type.service';
import { UtilsService } from '@app/services/utils.service';
import { ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import {
  SuppliesRequestEditStatusFormComponent
} from '../supplies-request-edit-status-form/supplies-request-edit-status-form.component';
import { SuppliesRequestFormComponent } from '../supplies-request-form/supplies-request-form.component';

@Component({
  selector: 'app-supplies-request-list',
  templateUrl: './supplies-request-list.page.html',
  styleUrls: ['./supplies-request-list.page.scss'],
})
export class SuppliesRequestListPage implements OnInit {
  requests: SupplyInterface[] = [];
  statuses: TypeInterface[] = [];

  constructor(
    private modalController: ModalController,
    private typeService: TypeService,
    private supplyDatabase: SupplyDatabase,
    private supplyService: SupplyService,
    public utilsService: UtilsService,
  ) {
  }

  async ngOnInit() {
    this.statuses = await this.typeService.getByTypeWithMappedKeys('supplies_request_status');

    this.requests = await this.supplyDatabase.getAll();
  }

  async openFormModal() {
    const modal = await this.modalController.create({
      component: SuppliesRequestFormComponent,
      cssClass: 'popup',
      backdropDismiss: false
    });

    await modal.present();

    modal.onDidDismiss().then((res) => this.onFormModalDidDismiss(res));
  }

  async openStatusModal(request: SupplyInterface) {
    const modal = await this.modalController.create({
      component: SuppliesRequestEditStatusFormComponent,
      cssClass: 'popup',
      backdropDismiss: false,
      componentProps: {
        request,
      }
    });

    await modal.present();
  }

  onFormModalDidDismiss(res: OverlayEventDetail) {
    if (res.role === 'submit') {
      this.requests.push(res.data);
    }
  }

  getStatusName(key: string): string {
    return this.statuses.find(status => status.type_key === key)?.type_value || '';
  }

  getStatusClass(status: string){
    return 'status-'+ (status?.replace(/_/g, '-') || '');
  }

  async onStatusChange(e) {
    const statusKey = e.detail.value?.type_key;

    this.requests = statusKey
      ? await this.supplyService.getAllByDeliveryStatus(statusKey)
      : await this.supplyDatabase.getAll();
  }
}
