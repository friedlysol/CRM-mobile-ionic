import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';
import { AssetInterface } from '@app/interfaces/asset.interface';
import { AssetService } from '@app/services/asset.service';
import { AssetDatabase } from '@app/services/database/asset.database';
import { WorkOrderDatabase } from '@app/services/database/workorder.database';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { PurchaseOrderEntryInterface } from '@app/interfaces/purchase-order.interface';
import { LaborRequestComponent } from '@app/modals/labor-request/labor-request.component';
import {
  PurchaseOrderEntryComponent
} from '@app/pages/purchase-order/modals/purchase-order-entry/purchase-order-entry.component';

@Component({
  selector: 'app-purchase-order-form',
  templateUrl: './purchase-order-form.page.html',
  styleUrls: ['./purchase-order-form.page.scss'],
})
export class PurchaseOrderFormPage implements OnInit {
  public form: FormGroup;

  public entries: PurchaseOrderEntryInterface[] = [];

  public assetUuid: string;
  public workOrderUuid: string;

  public workOrders: WorkOrderInterface[];

  private mappedVendors: any = {
    'window': [
      {'type_value': 'MGM', 'type_key': 'vendor.mgm'},
      {'type_value': 'Alside', 'type_key': 'vendor.alside'},
      {'type_value': 'Other', 'type_key': 'vendor.other'}
    ],
    'bath': [
      {'type_value': 'Liners/Jacuzzi', 'type_key': 'vendor.liners_jacuzzi'},
      {'type_value': 'Kohler', 'type_key': 'vendor.kohler'},
      {'type_value': 'HMI', 'type_key': 'vendor.hmi'},
      {'type_value': 'Cardinal', 'type_key': 'vendor.cardinal'},
      {'type_value': 'Other', 'type_key': 'vendor.other'}
    ],
    'walk-in': [
      {'type_value': 'Norcom/Best Bath', 'type_key': 'vendor.norcom_best_bath'},
    ]
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private assetDatabase: AssetDatabase,
    private modalController: ModalController,
    private navController: NavController,
    private router: Router,
    private workOrderDatabase: WorkOrderDatabase
  ) {
    this.activatedRoute.queryParamMap.subscribe(async params => {
      this.assetUuid = params.get('assetUuid') || null;
      this.workOrderUuid = params.get('workOrderUuid');
    });
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    if (this.workOrderUuid) {
      this.workOrders = [await this.workOrderDatabase.getByUuid(this.workOrderUuid)];
    } else {
      this.workOrders = await this.workOrderDatabase.getActive();
    }

    this.workOrders = this.workOrders.map(workOrder => {
      if (!workOrder.call_type) {
        workOrder.call_type = 'bath';
      }

      workOrder.label = 'Wo #: ' + workOrder.work_order_number + ' ' + workOrder.client + ' (' + workOrder.call_type + ')';

      return workOrder;
    })

    this.initForm();
  }

  public vendors() {
    const workOrder = this.getSelectedWorkOrder();

    if (workOrder) {
      if (this.mappedVendors.hasOwnProperty(workOrder.call_type)) {
        return this.mappedVendors[workOrder.call_type];
      }
    }

    return [];
  }

  get isCompletesJob() {
    return this.form.get('is_completes_job');
  }

  get poNumber() {
    return this.form.get('purchase_order_number');
  }

  get supplierName() {
    return this.form.get('supplier_name');
  }

  get woUuid() {
    return this.form.get('work_order_uuid');
  }

  onCancelClick() {
    console.log('form', this.form.value);

    this.navController.back();
  }

  onSaveClick() {
    console.log('form', this.form.value);

    this.navController.back();
  }

  async onAddEntryClick() {
    const modal = await this.modalController.create({
      component: PurchaseOrderEntryComponent,
      componentProps: {
        workOrder: this.getSelectedWorkOrder()
      },
      cssClass: 'popup',
      backdropDismiss: false,

    });

    await modal.present();

    modal.onDidDismiss().then((res) => {
      if (res.role === 'submit') {
        this.entries.push(res.data);
      }
    });
  }

  private initForm() {
    const controls = {
      work_order_uuid: new FormControl(this.workOrderUuid),
      purchase_order_number: new FormControl(null),
      supplier_name: new FormControl(null),
      is_completes_job: new FormControl(null),
    };

    this.form = new FormGroup(controls);
  }

  private getSelectedWorkOrder() {
    const workOrderUuid = this.woUuid.getRawValue();

    if (workOrderUuid) {
      return this.workOrders.find(workOrder => workOrder.uuid === workOrderUuid);
    }

    return null;
  }

  async removeEntry(entry: PurchaseOrderEntryInterface) {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to delete this entry?',
      cssClass: 'form-alert',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Submit',
          role: 'submit',
          cssClass: 'alert-button-confirm',
        },
      ]
    });

    alert.present();

    alert.onDidDismiss().then((data) => {
      if (data.role === 'submit') {
        this.entries = this.entries.filter(item => item !== entry);
      }
    });
  }
}
