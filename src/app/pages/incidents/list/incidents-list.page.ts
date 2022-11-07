import { Component, OnInit } from '@angular/core';
import { IncidentInterface } from '@app/interfaces/incident.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { IncidentsDatabase } from '@app/services/database/incidents.database';

@Component({
  selector: 'app-incidents-list',
  templateUrl: './incidents-list.page.html',
  styleUrls: ['./incidents-list.page.scss'],
})
export class IncidentsListPage implements OnInit {
  statuses: TypeInterface[] = [
    {
      id: 0,
      type: '',
      type_key: 'incomplete',
      type_value: 'Incomplete',
      type_order: 0,
      type_color: ''
    },
    {
      id: 1,
      type: '',
      type_key: 'complete',
      type_value: 'Complete',
      type_order: 0,
      type_color: ''
    }
  ];

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

  incidents: IncidentInterface[] = [];

  constructor(
    private incidentDatabse: IncidentsDatabase,
  ) { }

  async ngOnInit() {
    this.incidents = await this.incidentDatabse.getAll();
    console.log(this.incidents)
  }

  getTypeById(id: number){
    return this.incidentsTypes.find(type => type.id === id);
  }

  onStatusChange(event){
    console.log(event)
  }
}
