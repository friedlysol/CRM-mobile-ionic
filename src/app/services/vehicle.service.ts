import { Injectable } from '@angular/core';
import { VehicleApi } from '@app/providers/api/vehicle-api';
import { ResponseVehicleApiInterface } from '@app/providers/api/interfaces/response-vehicle-api.interface';
import { VehicleDatabase } from '@app/services/database/vehicle.database';
import { DatabaseService } from '@app/services/database.service';
import { SyncInterface } from '@app/interfaces/sync.interface';

@Injectable({
  providedIn: 'root'
})
export class VehicleService implements SyncInterface {
  syncTitle = 'vehicles';

  constructor(
    private databaseService: DatabaseService,
    private vehicleApi: VehicleApi,
    private vehicleDatabase: VehicleDatabase
  ) {
  }

  async sync(): Promise<boolean> {
    return this.vehicleApi.sync({})
      .toPromise()
      .then(async (res: ResponseVehicleApiInterface) => {
        await this.syncVehicles(res);

        await this.removeOldRecords(res);

        return true;
      });
  }

  /**
   * Sync vehicles
   *
   * @param res
   * @private
   */
  private async syncVehicles(res: ResponseVehicleApiInterface) {
    const vehicles = res?.response?.vehicles || [];

    // get existing vehicles map from app db
    const existingVehiclesHashMap = await this.vehicleDatabase.getExistingVehiclesAsMap();

    const queue = [];

    vehicles.forEach(vehicle => {
      const vehicleId = Number(vehicle.id);

      let query = null;

      if (existingVehiclesHashMap.hasOwnProperty(vehicleId)) {
        const existingVehicleHash = existingVehiclesHashMap[vehicleId];

        if (vehicle.hash !== existingVehicleHash) {
          query = this.vehicleDatabase.getSqlForUpdateFromApiData(vehicle, {id: vehicleId});
        }
      } else {
        query = this.vehicleDatabase.getSqlForCreateFromApiData(vehicle);
      }

      if (query) {
        queue.push(query);
      }
    });

    console.log('syncVehicles', queue);

    return this.databaseService.bulkQueries(queue);
  }

  private async removeOldRecords(res: ResponseVehicleApiInterface) {
    const vehicles = res?.response?.vehicles || [];

    if (vehicles.length) {
      const vehicleIds = vehicles.map(vehicle => vehicle.id);

      return this.vehicleDatabase.removeByVehicleIds(vehicleIds);
    }

    return Promise.resolve(null);
  }
}
