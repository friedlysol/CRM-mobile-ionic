import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IncidentPerson, InjuryPersonInterface } from '@app/interfaces/incident.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-injuried-persons-form',
  templateUrl: './injured-persons-form.component.html',
  styleUrls: ['./injured-persons-form.component.scss'],
})
export class InjuredPersonsFormComponent implements OnInit {
  injuryTypes: TypeInterface[] = [
    {
      id: 1,
      type: '',
      type_key: 'first',
      type_value: 'First',
      type_order: 0,
      type_color: ''
    },
    {
      id: 2,
      type: '',
      type_key: 'second',
      type_value: 'Second',
      type_order: 0,
      type_color: ''
    }
  ];

  bodyPartTypes: TypeInterface[] = [
    {
      id: 1,
      type: '',
      type_key: 'first',
      type_value: 'First',
      type_order: 0,
      type_color: ''
    },
    {
      id: 2,
      type: '',
      type_key: 'second',
      type_value: 'Second',
      type_order: 0,
      type_color: ''
    }
  ];

  treatmentTypes: TypeInterface[] = [
    {
      id: 1,
      type: '',
      type_key: 'first',
      type_value: 'First',
      type_order: 0,
      type_color: ''
    },
    {
      id: 2,
      type: '',
      type_key: 'second',
      type_value: 'Second',
      type_order: 0,
      type_color: ''
    }
  ];

  formGroup = new FormGroup({
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
    phone_number: new FormControl(''),
    email: new FormControl('', [Validators.email]),
    injury_type_id: new FormControl(null, [Validators.required]),
    body_part_id: new FormControl(null, [Validators.required]),
    treatment_type_id: new FormControl(null, [Validators.required]),
  });

  constructor(
    private modalControler: ModalController,
    private navParams: NavParams,
  ) {}

  get firstNameCtrl() {
    return this.formGroup.controls.first_name;
  }
  get lastNameCtrl() {
    return this.formGroup.controls.last_name;
  }
  get phoneNumberCtrl() {
    return this.formGroup.controls.phone_number;
  }
  get emailCtrl() {
    return this.formGroup.controls.email;
  }
  get injuryTypeCtrl() {
    return this.formGroup.controls.injury_type_id;
  }
  get bodyPartCtrl() {
    return this.formGroup.controls.body_part_id;
  }
  get treatmentTypeCtrl() {
    return this.formGroup.controls.treatment_type_id;
  }

  ngOnInit() {
    if(this.navParams.data?.injuredPerson){
      this.formGroup.patchValue(this.navParams.data.injuredPerson);
    }
  }

  onCancelClick(){
    this.modalControler.dismiss(null, 'cancel');
  }

  onSubmit(){
    if(this.formGroup.invalid){
      Object.keys(this.formGroup.controls).forEach(key => {
        this.formGroup.get(key).markAsDirty();
      });
      this.formGroup.markAllAsTouched();
      return;
    }

    const injuryPerson: IncidentPerson = this.formGroup.getRawValue();
    this.modalControler.dismiss(injuryPerson, 'submit');
  }
}