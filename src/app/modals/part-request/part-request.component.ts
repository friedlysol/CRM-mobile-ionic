import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { TypeInterface } from '@app/interfaces/type.interface';
import { TypeService } from '@app/services/type.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-part-request',
  templateUrl: './part-request.component.html',
  styleUrls: ['./part-request.component.scss'],
})
export class PartRequestComponent implements OnInit {
  public form: FormGroup;

  private objectType: string;
  private objectUuid: string;
  private assetTypeId: number;

  public partRequestTypes: TypeInterface[] = [];

  constructor(private modalController: ModalController, private navParams: NavParams, private typeService: TypeService) {
    this.objectType = navParams.data.objectType;
    this.objectUuid = navParams.data.objectUuid;
    this.assetTypeId = navParams.data.assetTypeId || null;
  }

  async ngOnInit() {
    const types = await this.typeService.getByTypes(['part_request_bath', 'part_request_window']);

    if(this.assetTypeId) {
      const assetType = await this.typeService.getById(this.assetTypeId);

      if(assetType.type_key === 'asset_type.window') {
        this.partRequestTypes = types.filter(type => type.type === 'part_request_window')
      } else if(assetType.type === 'asset_type.bath') {
        this.partRequestTypes = types.filter(type => type.type === 'part_request_bath')
      }
    } else {
      this.partRequestTypes = types.map(type => {
        if(type.type_key.indexOf('.other')) {
          type.type_value = type.type.split('_').pop() + ': ' + type.type_value;
        }

        return type;
      });
    }
  }

  async ionViewWillEnter() {
    this.initForm();
  }

  private initForm() {
    const controls = {
      type_id: new FormControl(null),
      quantity: new FormControl(null),
      comment: new FormControl(null),
    };

    this.form = new FormGroup(controls);
  }

  onCancel() {
    return this.modalController.dismiss();
  }

  onSubmit() {
    return this.modalController.dismiss();
  }
}
