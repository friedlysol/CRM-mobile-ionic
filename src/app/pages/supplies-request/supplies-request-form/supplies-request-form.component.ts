import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SupplyInterface } from '@app/interfaces/supply.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { SupplyDatabase } from '@app/services/database/supply.database';
import { TypeService } from '@app/services/type.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-supplies-request-form',
  templateUrl: './supplies-request-form.component.html',
  styleUrls: ['./supplies-request-form.component.scss'],
})
export class SuppliesRequestFormComponent implements OnInit {
  jobTypes: TypeInterface[] = [];

  requestForm = new FormGroup({
    jobType: new FormControl(null, [Validators.required]),
    type: new FormControl(null, [Validators.required]),
    quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
  });

  constructor(
    private modalController: ModalController,
    private supplyDatabase: SupplyDatabase,
    private typeService: TypeService,
  ) {
  }

  get jobType() {
    return this.requestForm.get('jobType');
  }

  get type() {
    return this.requestForm.get('type');
  }

  get quantity() {
    return this.requestForm.get('quantity');
  }

  async ngOnInit() {
    this.jobTypes = await this.typeService.getByType('supplies_request_job_type');
  }

  async onSubmit() {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      this.requestForm.controls.jobType.markAsDirty();
      return;
    }

    let request: SupplyInterface = {
      quantity: this.requestForm.value.quantity,
      job_type_id: this.requestForm.value.jobType.id,
      type: this.requestForm.value.type,
      created_at: '',
    };

    request = await this.supplyDatabase.createRequest(request);

    await this.modalController.dismiss(request, 'submit');
  }

  onCancel() {
    this.modalController.dismiss();
  }
}
