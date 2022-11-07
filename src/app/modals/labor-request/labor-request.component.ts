import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TypeInterface } from '@app/interfaces/type.interface';
import { ModalController, NavParams } from '@ionic/angular';
import { TypeService } from '@app/services/type.service';

@Component({
  selector: 'app-labor-request',
  templateUrl: './labor-request.component.html',
  styleUrls: ['./labor-request.component.scss'],
})
export class LaborRequestComponent implements OnInit {
  public form: FormGroup;

  private objectType: string;
  private objectUuid: string;

  constructor(private modalController: ModalController, private navParams: NavParams, private typeService: TypeService) {
    this.objectType = navParams.data.objectType;
    this.objectUuid = navParams.data.objectUuid;
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.initForm();
  }

  private initForm() {
    const controls = {

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
