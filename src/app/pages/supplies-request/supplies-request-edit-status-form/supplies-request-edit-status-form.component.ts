import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SupplyInterface } from '@app/interfaces/supply.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { SupplyDatabase } from '@app/services/database/supply.database';
import { TypeService } from '@app/services/type.service';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-supplies-request-edit-status-form',
  templateUrl: './supplies-request-edit-status-form.component.html',
  styleUrls: ['./supplies-request-edit-status-form.component.scss'],
})
export class SuppliesRequestEditStatusFormComponent implements OnInit {
  request: SupplyInterface;
  statuses: TypeInterface[] = [];

  requestForm = new FormGroup({
    status: new FormControl(null, [Validators.required]),
    comment: new FormControl(''),
  });

  constructor(
    params: NavParams,
    private modalController: ModalController,
    private supplyDatabase: SupplyDatabase,
    private typeService: TypeService,
    ) {
      this.request = params.data.request != null ? params.data.request : null;
      if(this.request){
        this.status.setValue(this.request.delivery_status || null);
        this.comment.setValue(this.request.comment || '');
      }
    }

  get status() { return this.requestForm.get('status'); }
  get comment() { return this.requestForm.get('comment'); }

  async ngOnInit() {
    this.statuses = (await this.typeService.getByType('supplies_request_status'))
      .filter(status => status.type_key !== 'supplies_request_status.not_confirmed')
      .map(status => ({...status, type_key: status.type_key.split('.')[1]}));
  }

  async onSubmit(){
    if(!this.request){
      this.onCancel();
      return;
    }
    if(this.requestForm.invalid){
      this.status.markAsDirty();
      return;
    }
    this.request.technician_comment = this.comment.value;
    this.request.delivery_status = this.status.value.type_key;

    this.supplyDatabase.updateRequest(this.request);

    this.modalController.dismiss(this.request, 'submit');
  }

  onCancel(){
    this.modalController.dismiss(null, 'cancel');
  }
}
