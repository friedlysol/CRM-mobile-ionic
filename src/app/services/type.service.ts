import { Injectable } from '@angular/core';
import { TypeApi } from '@app/providers/api/type-api';
import { ResponseTypeApiInterface } from '@app/providers/api/interfaces/response-type-api.interface';
import { TypeDatabase } from '@app/services/database/type.database';
import { TypeInterface } from '@app/interfaces/type.interface';
import { SyncInterface } from '@app/interfaces/sync.interface';
import { DatabaseService } from '@app/services/database.service';

@Injectable({
  providedIn: 'root'
})
export class TypeService implements SyncInterface {
  syncTitle = 'types';

  constructor(private databaseService: DatabaseService, private typeDatabase: TypeDatabase, private typeApi: TypeApi) {

  }

  async sync(): Promise<boolean> {
    return this.typeApi.sync({})
      .toPromise()
      .then(async (res: ResponseTypeApiInterface) => {
        await this.syncTypes(res);

        return true;
      });
  }

  getByKey(key: string): Promise<TypeInterface> {
    return this.typeDatabase.getByKey(key);
  }

  getByType(type: string): Promise<TypeInterface[]> {
    return this.typeDatabase.getByType(type);
  }

  async getByTypeAsList(type: string): Promise<Record<string, number>> {
    const mappedStatuses = {};
    const statuses = await this.getByType('tech_status');

    if(statuses) {
      statuses.map(type => mappedStatuses[type.type_key] = type.id);
    }

    return mappedStatuses;
  }

  getByTypes(types: Array<string>): Promise<TypeInterface[]> {
    return this.typeDatabase.getByTypes(types);
  }

  /**
   * Sync time sheet types
   *
   * @param res
   * @private
   */
  private async syncTypes(res: ResponseTypeApiInterface) {
    const types = res?.response?.types || [];

    // get existing types map from app db
    const existingTypesHashMap = await this.typeDatabase.getExistingTypesAsMap();

    const queue = [];

    types.forEach(type => {
      const typeId = Number(type.id);

      let query = null;

      if (existingTypesHashMap.hasOwnProperty(typeId)) {
        const existingTypeHash = existingTypesHashMap[typeId];

        if (type.hash !== existingTypeHash) {
          query = this.typeDatabase.getSqlForUpdateFromApiData(type, {id: typeId});
        }
      } else {
        query = this.typeDatabase.getSqlForCreateFromApiData(type);
      }

      if (query) {
        queue.push(query);
      }
    });

    console.log('syncTypes', queue);

    return this.databaseService.bulkQueries(queue);
  }
}
