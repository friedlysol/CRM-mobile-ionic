import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SupplyInterface } from '@app/interfaces/supply.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
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
    private modalCtrl: ModalController,
    private typeService: TypeService,
    ) { }

  get jobType() { return this.requestForm.get('jobType'); }
  get type() { return this.requestForm.get('type'); }
  get quantity() { return this.requestForm.get('quantity'); }

  async ngOnInit() {
    this.jobTypes = await this.typeService.getByType('supplies_request_job_type');
    console.log(this.jobTypes);
  }

  onSubmit(){
    console.log(this.requestForm);
    if(this.requestForm.invalid){
      this.requestForm.markAllAsTouched();
      this.requestForm.controls.jobType.markAsDirty();
      return;
    }

    const request: SupplyInterface = {
      quantity: this.requestForm.value.quantity,
      created_at: ''
    };
    this.modalCtrl.dismiss(null, 'submit');
  }
}
