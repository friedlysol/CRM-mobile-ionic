import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IncidentInterface, IncidentPerson, InjuryPersonInterface } from '@app/interfaces/incident.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { AlertController, ModalController } from '@ionic/angular';
import { InjuredPersonsFormComponent } from './injured-persons-form/injured-persons-form.component'; 
import { PersonFormComponent } from './person-form/person-form.component';

@Component({
  selector: 'app-incidents-form',
  templateUrl: './incidents-form.page.html',
  styleUrls: ['./incidents-form.page.scss'],
})
export class IncidentsFormPage implements OnInit {
  incidentsTypes: TypeInterface[] = [
    {
      id: 1,
      type: '',
      type_key: 'injury',
      type_value: 'Injury',
      type_order: 0,
      type_color: ''
    },
    {
      id: 2,
      type: '',
      type_key: 'property_damage',
      type_value: 'Property Damage',
      type_order: 0,
      type_color: ''
    }
  ];
  analysisRootCauseTypes: TypeInterface[] = [
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
  analysisRiskTypes: TypeInterface[] = [
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
  analysisActivityBeingPerformedTypes: TypeInterface[] = [
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
    incident_type_id: new FormControl(null, [Validators.required]),
    incident_date: new FormControl('', [Validators.required]),
    incident_time: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    injury_persons: new FormControl([]),
    injury_description: new FormControl('', [Validators.required]),
    analysis_root_cause_type_id: new FormControl(null, [Validators.required]),
    analysis_risk_type_id: new FormControl(null, [Validators.required]),
    analysis_activity_being_performed_type_id: new FormControl(null, [Validators.required]),
    damage_property_owner: new FormControl('', [Validators.required]),
    damage_description: new FormControl('', [Validators.required]),
    damage_cause: new FormControl('', [Validators.required]),
    person_involved: new FormControl([]),
    witnesses: new FormControl([]),
  });

  constructor(
    private modalControler: ModalController,
  ) { }

  get incidentTypeCtrl() {
    return this.formGroup.controls.incident_type_id;
  }
  get incidentDateCtrl() {
    return this.formGroup.controls.incident_date;
  }
  get incidentTimeCtrl() {
    return this.formGroup.controls.incident_time;
  }
  get incidentLocationCtrl() {
    return this.formGroup.controls.location;
  }
  get descriptionCtrl() {
    return this.formGroup.controls.description;
  }
  get injuryPersonsCtrl(){
    return this.formGroup.controls.injury_persons;
  }
  get injuryDescriptionCtrl(){
    return this.formGroup.controls.injury_description;
  }
  get analysisRootCauseCtrl(){
    return this.formGroup.controls.analysis_root_cause_type_id;
  }
  get analysisRiskCtrl(){
    return this.formGroup.controls.analysis_risk_type_id;
  }
  get analysisActivityBeingPerformedCtrl(){
    return this.formGroup.controls.analysis_activity_being_performed_type_id;
  }
  get damagePropertyOwnerCtrl(){
    return this.formGroup.controls.damage_property_owner;
  }
  get damageDescriptionCtrl(){
    return this.formGroup.controls.damage_description;
  }
  get damageCauseCtrl(){
    return this.formGroup.controls.damage_cause;
  }
  get personInvolvedCtrl(){
    return this.formGroup.controls.person_involved;
  }
  get witnessesCtrl(){
    return this.formGroup.controls.witnesses;
  }

  ngOnInit() {}

  onRemovePersonClick(type: 'injured' | 'witness' | 'involved', index: number){
    this.getPersonControlByType(type)?.value.splice(index, 1);
  }

  getPersonControlByType(type: 'injured' | 'witness' | 'involved'){
    switch(type){
      case 'injured':
        return this.injuryPersonsCtrl;
      case 'witness':
        return this.witnessesCtrl;
      case 'involved':
        return this.personInvolvedCtrl;
    }
  }

  async showPersonForm(type: 'injured' | 'witness' | 'involved', personIndex?: number){
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
    if(res.role === 'submit'){
      if(person){

        control.value[personIndex] = res.data;
      }else{

        control.value.push(res.data);
      }
    }

  }

  onSubmit(){
    console.log(this.formGroup)
    if(this.formGroup.invalid){
      Object.keys(this.formGroup.controls).forEach(key => {
        this.formGroup.get(key).markAsDirty();
      });
      return;
    }

    const incident = this.formGroup.getRawValue();
    console.log('SAVED: ', incident)
  }
}
