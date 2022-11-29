import { Component, OnInit, Type } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IncidentInterface } from '@app/interfaces/incident.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { DatabaseService } from '@app/services/database.service';
import { IncidentsDatabase } from '@app/services/database/incidents.database';
import { TypeService } from '@app/services/type.service';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { PersonFormComponent } from './person-form/person-form.component';

@Component({
  selector: 'app-incidents-form',
  templateUrl: './incidents-form.page.html',
  styleUrls: ['./incidents-form.page.scss'],
})
export class IncidentsFormPage implements OnInit {
  statuses: TypeInterface[] = [];
  incidentsTypes: TypeInterface[] = [];
  analysisRootCauseTypes: TypeInterface[] = [];
  analysisRiskTypes: TypeInterface[] = [];
  analysisActivityBeingPerformedTypes: TypeInterface[] = [];
  photoType: TypeInterface;

  formGroup = new FormGroup({
    incident: new FormGroup({
      incident_type_id: new FormControl(null, [Validators.required]),
      incident_date: new FormControl('', [Validators.required]),
      incident_time: new FormControl('', [Validators.required]),
      incident_location: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      person_involved: new FormControl([]),
      witnesses: new FormControl([]),
      note: new FormControl(''),
    }),
    injury: new FormGroup({
      injury_persons: new FormControl([]),
      injury_description: new FormControl('', [Validators.required]),
      analysis_root_cause_type_id: new FormControl(null, [Validators.required]),
      analysis_risk_type_id: new FormControl(null, [Validators.required]),
      analysis_activity_being_performed_type_id: new FormControl(null, [Validators.required]),
      analysis_corrective_action_description: new FormControl('', [Validators.required]),
    }),
    damage_property: new FormGroup({
      damage_property_owner: new FormControl('', [Validators.required]),
      damage_description: new FormControl('', [Validators.required]),
      damage_cause: new FormControl('', [Validators.required]),
    }),
  });

  incident: IncidentInterface = {
    uuid: this.databaseService.getUuid(),
    incident_type_id: 0,
    incident_date: '',
    incident_time: '',
    incident_location: '',
    description: ''
  };

  constructor(
    private databaseService: DatabaseService,
    private incidentsDatabase: IncidentsDatabase,
    private modalControler: ModalController,
    private router: Router,
    private typeService: TypeService,
  ) {
  }

  get incidentTypeCtrl() {
    return this.formGroup.controls.incident.controls.incident_type_id;
  }

  get incidentDateCtrl() {
    return this.formGroup.controls.incident.controls.incident_date;
  }

  get incidentTimeCtrl() {
    return this.formGroup.controls.incident.controls.incident_time;
  }

  get incidentLocationCtrl() {
    return this.formGroup.controls.incident.controls.incident_location;
  }

  get descriptionCtrl() {
    return this.formGroup.controls.incident.controls.description;
  }

  get injuryPersonsCtrl() {
    return this.formGroup.controls.injury.controls.injury_persons;
  }

  get injuryDescriptionCtrl() {
    return this.formGroup.controls.injury.controls.injury_description;
  }

  get analysisRootCauseCtrl() {
    return this.formGroup.controls.injury.controls.analysis_root_cause_type_id;
  }

  get analysisRiskCtrl() {
    return this.formGroup.controls.injury.controls.analysis_risk_type_id;
  }

  get analysisActivityBeingPerformedCtrl() {
    return this.formGroup.controls.injury.controls.analysis_activity_being_performed_type_id;
  }

  get analysisCorrectiveActionDescriptionCtrl() {
    return this.formGroup.controls.injury.controls.analysis_corrective_action_description;
  }

  get damagePropertyOwnerCtrl() {
    return this.formGroup.controls.damage_property.controls.damage_property_owner;
  }

  get damageDescriptionCtrl() {
    return this.formGroup.controls.damage_property.controls.damage_description;
  }

  get damageCauseCtrl() {
    return this.formGroup.controls.damage_property.controls.damage_cause;
  }

  get personInvolvedCtrl() {
    return this.formGroup.controls.incident.controls.person_involved;
  }

  get witnessesCtrl() {
    return this.formGroup.controls.incident.controls.witnesses;
  }

  get noteCtrl() {
    return this.formGroup.controls.incident.controls.note;
  }

  get isInjuryType() {
    return this.incident.incident_type_id === this.incidentsTypes.find(type => type.type_key === 'incident_type.injury')?.id;
  }

  get isPropertyDamageType() {
    return this.incident.incident_type_id === this.incidentsTypes.find(type => type.type_key === 'incident_type.property_demage')?.id;
  }

  async ngOnInit() {
    this.statuses = await this.typeService.getByType('incident_status');
    this.incidentsTypes = await this.typeService.getByType('incident_type');
    this.analysisRootCauseTypes = await this.typeService.getByType('incident_root_cause');
    this.analysisRiskTypes = await this.typeService.getByType('incident_risk_type');
    this.analysisActivityBeingPerformedTypes = await this.typeService.getByType('incident_activity_being_performed');
    this.photoType = await this.typeService.getByKey('incident_photo_type.description');
  }

  onTypeChange(e) {
    this.incident.incident_type_id = e.detail.value;
  }

  onRemovePersonClick(type: 'injured' | 'witness' | 'involved', index: number) {
    this.getPersonControlByType(type)?.value.splice(index, 1);
  }

  getPersonControlByType(type: 'injured' | 'witness' | 'involved') {
    switch (type) {
      case 'injured':
        return this.injuryPersonsCtrl;
      case 'witness':
        return this.witnessesCtrl;
      case 'involved':
        return this.personInvolvedCtrl;
    }
  }

  async showPersonForm(type: 'injured' | 'witness' | 'involved', personIndex?: number) {
    const control = this.getPersonControlByType(type);
    const person = control?.value[personIndex];

    const modal = await this.modalControler.create({
      component: PersonFormComponent,
      cssClass: 'popup',
      backdropDismiss: false,
      componentProps: {
        person,
        type,
      }
    });

    modal.present();

    const res = await modal.onDidDismiss();
    if (res.role === 'submit') {
      if (person) {

        control.value[personIndex] = res.data;
      } else {

        control.value.push(res.data);
      }
    }
  }

  async onSubmit() {
    Object.keys(this.formGroup.controls.incident.controls).forEach(key => {
      this.formGroup.controls.incident.get(key).markAsDirty();
    });

    Object.keys(this.formGroup.controls.injury.controls).forEach(key => {
      this.formGroup.controls.injury.get(key).markAsDirty();
    });

    Object.keys(this.formGroup.controls.damage_property.controls).forEach(key => {
      this.formGroup.controls.damage_property.get(key).markAsDirty();
    });

    if (this.formGroup.controls.incident.invalid ||
      this.isInjuryType && this.formGroup.controls.injury.invalid ||
      this.isPropertyDamageType && this.formGroup.controls.damage_property.invalid) {

      return;
    }

    const newIncident: IncidentInterface = {
      uuid: this.incident.uuid,
      status_type_id: this.statuses.find(status => status.type_key === 'incident_status.open')?.id,
      ...this.formGroup.getRawValue().incident,
      ...this.formGroup.getRawValue().injury,
      ...this.formGroup.getRawValue().damage_property,
    };

    const dateTime = moment(newIncident.incident_date + ' ' + newIncident.incident_time).utc(false);

    newIncident.incident_date = dateTime.format('YYYY-MM-DD');
    newIncident.incident_time = dateTime.format('HH:mm');

    await this.incidentsDatabase.create(newIncident);

    return this.router.navigateByUrl('incidents/list', {replaceUrl: true});
  }
}
