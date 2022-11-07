import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { TypeService } from '@app/services/type.service';
import { WorkOrderInterface } from '@app/interfaces/work-order.interface';
import { MessageInterface } from '@app/interfaces/message.interface';

@Component({
  selector: 'app-purchase-order-entry',
  templateUrl: './purchase-order-entry.component.html',
  styleUrls: ['./purchase-order-entry.component.scss'],
})
export class PurchaseOrderEntryComponent implements OnInit {
  public form: FormGroup;

  private mappedMaterials: any = {
    'window': [
      {'type_value': 'Window/Door', 'type_key': 'material.window_door'},
      {'type_value': 'Coil', 'type_key': 'material.coil'},
      {'type_value': 'Other', 'type_key': 'material.other'}
    ],
    'bath': [
      {'type_value': 'Pan', 'type_key': 'material.pan'},
      {'type_value': 'Door', 'type_key': 'material.door'},
      {'type_value': 'Panel', 'type_key': 'material.panel'},
      {'type_value': 'Hardware', 'type_key': 'material.hardware'},
      {'type_value': 'Other', 'type_key': 'material.other'}
    ],
    'walk-in': [
      {'type_value': 'Panel', 'type_key': 'material.panel'},
      {'type_value': 'Other', 'type_key': 'material.other'}
    ]
  }

  private workOrder: WorkOrderInterface;

  constructor(private modalController: ModalController, private navParams: NavParams, private typeService: TypeService) {
    this.workOrder = navParams.data.workOrder;
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.initForm();
  }

  get materialType() {
    return this.form.get('material_type');
  }

  get quantity() {
    return this.form.get('quantity');
  }

  get price() {
    return this.form.get('price');
  }

  public materials() {
    if(this.mappedMaterials.hasOwnProperty(this.workOrder.call_type)) {
      return this.mappedMaterials[this.workOrder.call_type];
    }

    return [];
  }

  private initForm() {
    const controls = {
      material_type: new FormControl(null, [Validators.required]),
      material_type_comment: new FormControl(null),
      quantity: new FormControl(null, [Validators.required]),
      price: new FormControl(null),
    }

    this.form = new FormGroup(controls);
  }

  onCancel() {
    return this.modalController.dismiss();
  }

  async onSubmit() {
    // if (this.form.invalid) {
    //   this.form.markAllAsTouched();
    //
    //   return;
    // }

    const entry = {
      description: this.materialType.getRawValue(),
      quantity: this.quantity.getRawValue(),
      price: this.price.getRawValue(),
    };

    await this.modalController.dismiss(entry, 'submit');
  }
}
