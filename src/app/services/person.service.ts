import { Injectable } from '@angular/core';
import { SyncInterface } from '@app/interfaces/sync.interface';
import { DatabaseService } from '@app/services/database.service';
import { PersonApi } from '@app/providers/api/person-api';
import { ResponsePersonApiInterface } from '@app/providers/api/interfaces/response-person-api.interface';
import { PersonDatabase } from '@app/services/database/person.database';

@Injectable({
  providedIn: 'root'
})
export class PersonService implements SyncInterface {
  syncTitle = 'Person';

  constructor(
    private databaseService: DatabaseService,
    private personApi: PersonApi,
    private personDatabase: PersonDatabase
  ) {

  }

  async sync(): Promise<boolean> {
    const syncData = {
      hashes: {
        persons: await this.databaseService.getHashes('persons'),
      },
      quick_sync: 1
    };

    return this.personApi.sync(syncData)
      .toPromise()
      .then(async (res: ResponsePersonApiInterface) => {
        await this.syncPerson(res);

        return true;
      });
  }

  /**
   * Sync person
   *
   * @param res
   * @private
   */
  private async syncPerson(res: ResponsePersonApiInterface) {
    const persons = res?.response?.persons || [];

    const personIds = persons.map(person => person.id);

    // get existing types map from app db
    const existingPersonsHashMap = await this.databaseService.getExistingRecordsAsMap(personIds, 'persons');

    const queue = [];

    persons.forEach(person => {
      const personId = Number(person.id);

      let query = null;

      if (existingPersonsHashMap.hasOwnProperty(personId)) {
        const existingPersonHash = existingPersonsHashMap[personId].hash;

        if (person.hash !== existingPersonHash) {
          query = this.personDatabase.getSqlForUpdateFromApiData(person, {id: personId});
        }
      } else {
        query = this.personDatabase.getSqlForCreateFromApiData(person);
      }

      if (query) {
        queue.push(query);
      }
    });

    return this.databaseService.bulkQueries(queue);
  }
}
