import { Injectable } from '@angular/core';
import { IncidentInterface } from '@app/interfaces/incident.interface';
import { DatabaseService } from '../database.service';
import * as sqlBuilder from 'sql-bricks';
import * as _ from 'underscore';

@Injectable({
    providedIn: 'root'
})
export class IncidentsDatabase {
    allowFields: Array<string> = [
        'incident_type_id',
        'incident_date',
        'incident_time',
        'incident_location',
        'description',
        'injury_description',
        'analysis_root_cause_type_id',
        'analysis_activity_being_performed_type_id',
        'analysis_corrective_action_description',
        'damage_property_owner',
        'damage_description',
        'damage_cause',
        'note',
    ];

    constructor(private databaseService: DatabaseService) {}

    getByUuid(uuid: string): Promise<IncidentInterface> {
        return this.databaseService.findOrNull(`
            select *
            from incidents
            where uuid = ?`, [
          uuid
        ]).then((incident) => this.mapJsonFieldsToObjects(incident));
    };

    async getAll(): Promise<IncidentInterface[]> {
        return this.databaseService.findAsArray(
            `select *
            from incidents
            order by created_at desc`
        ).then((incidents) => incidents.map(incident => this.mapJsonFieldsToObjects(incident)));
    };

    /**
     * Create incident in db
     *
     * @param incident
     */
     async create(incident: IncidentInterface): Promise<IncidentInterface> {
        const uuid = incident.uuid || this.databaseService.getUuid();

        const injury_persons = JSON.stringify(incident.injury_persons);
        const person_involved = JSON.stringify(incident.person_involved);
        const witnesses = JSON.stringify(incident.witnesses);

        const query = sqlBuilder.insert('incidents', Object.assign({
                uuid,
                injury_persons,
                person_involved,
                witnesses,
                created_at: this.databaseService.getTimeStamp(),
                sync: 0,
            }, _.pick(incident, this.allowFields))
        );

        return this.databaseService.query(query.toString(), query.toParams())
            .then(() => this.getByUuid(uuid));
    }

    private mapJsonFieldsToObjects(incident){
        if(incident.person_involved){
            incident.person_involved = JSON.parse(incident.person_involved);
        }
        if(incident.injury_persons){
            incident.injury_persons = JSON.parse(incident.injury_persons);
        }
        if(incident.witnesses){
            incident.witnesses = JSON.parse(incident.witnesses);
        }

        return incident;
    }
}
