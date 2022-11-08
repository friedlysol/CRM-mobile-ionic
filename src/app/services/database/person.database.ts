import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { PersonInterface } from '@app/interfaces/person.interface';
import { PersonApiInterface } from '@app/providers/api/interfaces/response-person-api.interface';

import * as sqlBuilder from 'sql-bricks';

@Injectable({
  providedIn: 'root'
})
export class PersonDatabase {
  constructor(private databaseService: DatabaseService) {
  }

  getAll() {
    return this.databaseService
      .findAsArray(`
        select * 
        from persons 
        order by first_name, last_name
      `);
  }

  /**
   * Get person by id
   *
   * @param personId
   */
  getById(personId: number): Promise<PersonInterface> {
    return this.databaseService
      .findOrNull(`select * from persons where id = ?`, [personId]);
  }

  getSqlForCreateFromApiData(person: PersonApiInterface) {
    return sqlBuilder.insert('persons', Object.assign({
      uuid: this.databaseService.getUuid(),
      created_at: this.databaseService.getTimeStamp(),
      updated_at: null,
    }, this.typeDatabaseObj(person)));
  }

  getSqlForUpdateFromApiData(person: PersonApiInterface, condition: { id: number }) {
    return sqlBuilder
      .update('persons', Object.assign({
        updated_at: this.databaseService.getTimeStamp(),
      }, this.typeDatabaseObj(person)))
      .where(condition);
  }

  private typeDatabaseObj(person: PersonApiInterface): PersonInterface {
    return {
      id: person.id,
      kind: person.kind,
      type: person.type,
      first_name: person.first_name,
      last_name: person.last_name,
      status_type_id: person.status_type_id,
      hash: person.hash
    };
  }
}
