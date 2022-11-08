import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IncidentPerson } from '@app/interfaces/incident.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { TypeService } from '@app/services/type.service';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss'],
})
export class PersonFormComponent implements OnInit {

  injuryTypes: TypeInterface[] = [];
  bodyPartTypes: TypeInterface[] = [];
  treatmentTypes: TypeInterface[] = [];

  formGroup: FormGroup = new FormGroup({
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
    phone_number: new FormControl(''),
    email: new FormControl('', [Validators.email]),
  });
  type: 'injured' | 'involved' | 'witness';

  constructor(
    private modalControler: ModalController,
    private navParams: NavParams,
    private typeService: TypeService,
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

  get statementCtrl() {
    return this.formGroup.controls.statement;
  }

  async ngOnInit() {
    this.injuryTypes = await this.typeService.getByType('incident_injury_type');
    this.bodyPartTypes = await this.typeService.getByType('incident_body_part');
    this.treatmentTypes = await this.typeService.getByType('incident_treatment_type');

    this.type = this.navParams.data?.type;
    if (this.type === 'injured') {
      this.formGroup.addControl(
        'injury_type_id',
        new FormControl(null, [Validators.required])
      );
      this.formGroup.addControl(
        'body_part_id',
        new FormControl(null, [Validators.required])
      );
      this.formGroup.addControl(
        'treatment_type_id',
        new FormControl(null, [Validators.required])
      );

    } else if (this.type === 'witness') {
      this.formGroup.addControl(
        'statement',
        new FormControl('', [Validators.required])
      );
    }

    if (this.navParams.data?.person) {
      this.formGroup.patchValue(this.navParams.data.person);
    }
  }

  getTitle() {
    switch (this.type) {
      case 'injured':
        return 'Add injured person';
      case 'involved':
        return 'Add involved person';
      case 'witness':
        return 'Add witness';
    }
  }

  onCancelClick() {
    this.modalControler.dismiss(null, 'cancel');
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      Object.keys(this.formGroup.controls).forEach(key => {
        this.formGroup.get(key).markAsDirty();
      });
      this.formGroup.markAllAsTouched();
      return;
    }

    const person: IncidentPerson = this.formGroup.getRawValue();
    this.modalControler.dismiss(person, 'submit');
  }

}
