import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IncidentInterface } from '@app/interfaces/incident.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { IncidentsDatabase } from '@app/services/database/incidents.database';
import { TypeService } from '@app/services/type.service';
import { UtilsService } from '@app/services/utils.service';

@Component({
  selector: 'app-incidents-view',
  templateUrl: './incidents-view.page.html',
  styleUrls: ['./incidents-view.page.scss'],
})
export class IncidentsViewPage implements OnInit {
  incident: IncidentInterface;
  incidentTypes: TypeInterface[] = [];
  rootCauseTypes: TypeInterface[] = [];
  riskTypes: TypeInterface[] = [];
  activityBeingPerformedTypes: TypeInterface[] = [];
  injuryTypes: TypeInterface[] = [];
  bodyPartTypes: TypeInterface[] = [];
  treatmentTypes: TypeInterface[] = [];
  photoType: TypeInterface;

  constructor(
    private incidentsDatabase: IncidentsDatabase,
    private route: ActivatedRoute,
    private typeService: TypeService,
    public utilsService: UtilsService,
  ) { }

  get isInjuryType(){
    return this.incident.incident_type_id === this.incidentTypes.find(type => type.type_key === 'incident_type.injury')?.id;
  }
  get isPropertyDamageType(){
    return this.incident.incident_type_id === this.incidentTypes.find(type => type.type_key === 'incident_type.property_demage')?.id;
  }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const uuid = params.get('incidentUuid');
      this.incident = await this.incidentsDatabase.getByUuid(uuid);
    });

    this.incidentTypes = await this.typeService.getByType('incident_type');
    this.rootCauseTypes = await this.typeService.getByType('incident_root_cause');
    this.riskTypes = await this.typeService.getByType('incident_risk_type');
    this.activityBeingPerformedTypes = await this.typeService.getByType('incident_activity_being_performed');
    this.injuryTypes = await this.typeService.getByType('incident_injury_type');
    this.bodyPartTypes = await this.typeService.getByType('incident_body_part');
    this.treatmentTypes = await this.typeService.getByType('incident_treatment_type');
    this.photoType = await this.typeService.getByKey('incident_photo_type.description');
  }

  getIncidentType(id: number) {
    return this.incidentTypes.find(type => type.id === id);
  }

  getRootCauseType(id: number) {
    return this.rootCauseTypes.find(type => type.id === id);
  }

  getRiskType(id: number) {
    return this.riskTypes.find(type => type.id === id);
  }

  getActivityBeingPerformedType(id: number) {
    return this.activityBeingPerformedTypes.find(type => type.id === id);
  }

  getInjuryType(id: number) {
    return this.injuryTypes.find(type => type.id === id);
  }

  getBodyPartTypes(ids: number[]) {
    return ids.map(id => this.bodyPartTypes.find(type => type.id === id)?.type_value).join(', ');
  }

  getTreatmentType(id: number) {
    return this.treatmentTypes.find(type => type.id === id);
  }
}
