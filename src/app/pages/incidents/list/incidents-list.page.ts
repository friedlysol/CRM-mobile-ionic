import { Component, OnInit } from '@angular/core';
import { FileInterface } from '@app/interfaces/file.interface';
import { IncidentInterface } from '@app/interfaces/incident.interface';
import { TypeInterface } from '@app/interfaces/type.interface';
import { IncidentsDatabase } from '@app/services/database/incidents.database';
import { FileService } from '@app/services/file.service';
import { TypeService } from '@app/services/type.service';
import { UtilsService } from '@app/services/utils.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-incidents-list',
  templateUrl: './incidents-list.page.html',
  styleUrls: ['./incidents-list.page.scss'],
})
export class IncidentsListPage implements OnInit {
  statuses: TypeInterface[] = [];
  incidentsTypes: TypeInterface[] = [];
  incidents: IncidentInterface[] = [];

  constructor(
    private fileService: FileService,
    private incidentDatabse: IncidentsDatabase,
    private typeService: TypeService,
    public utilsService: UtilsService,
  ) { }

  async ngOnInit() {
    this.statuses = await this.typeService.getByType('incident_status');
    this.incidentsTypes = await this.typeService.getByType('incident_type');
    this.incidents = await this.incidentDatabse.getAll();
    this.incidents.forEach(async (incident) => incident.thumbnail_path = await this.getThumbnail(incident.uuid));
  }

  getTypeById(id: number){
    return this.incidentsTypes.find(type => type.id === id);
  }

  getStatusById(id: number){
    return this.statuses.find(status => status.id === id);
  }

  async getThumbnail(uuid: string){
    const file = await this.fileService.getLastByObjectAndType('incidents', uuid, null);
    return file ? this.getFilePath(file) : '';
  }

  getFilePath(file: FileInterface) {
    const source = file.thumbnail ? file.thumbnail : file.path;

    return Capacitor.convertFileSrc(source);
  }

  async onStatusChange(event){
    const id = event.detail.value?.id;
    if(id){
      this.incidents = await this.incidentDatabse.getByStatus(id);
    }else{
      this.incidents = await this.incidentDatabse.getAll();
    }
    this.incidents.forEach(async (incident) => incident.thumbnail_path = await this.getThumbnail(incident.uuid));
  }
}
