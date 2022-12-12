import { Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';
import { VehicleApiInterface } from '@app/providers/api/interfaces/response-vehicle-api.interface';
import { VehicleInterface } from '@app/interfaces/vehicle.interface';

import * as sqlBuilder from 'sql-bricks';

@Injectable({
  providedIn: 'root'
})
export class VehicleDatabase {

  constructor(private databaseService: DatabaseService) {
  }

  getExistingVehiclesAsMap(): Promise<Record<number, string>> {
    const query = sqlBuilder
      .select('id', 'hash')
      .from('vehicles');

    return this.databaseService
      .findAsArray(query.toString(), query.toParams())
      .then(vehicles => {
        const vehiclesMap = {};

        if (vehicles && vehicles.length) {
          vehicles.forEach(vehicle => vehiclesMap[Number(vehicle.id)] = vehicle.hash);
        }

        return vehiclesMap;
      });
  }

  removeByVehicleIds(vehicleIds: number[]) {
    const query = sqlBuilder
      .delete('vehicles')
      .where(sqlBuilder.not(sqlBuilder.in('id', vehicleIds)));

    return this.databaseService.query(query.toString(), query.toParams());
  }

  getSqlForCreateFromApiData(vehicle: VehicleApiInterface) {
    return sqlBuilder.insert('vehicles', Object.assign({
      created_at: this.databaseService.getTimeStamp(),
      updated_at: null,
    }, this.vehicleDatabaseObj(vehicle)));
  }

  getSqlForUpdateFromApiData(vehicle: VehicleApiInterface, condition: { id: number }) {
    return sqlBuilder
      .update('vehicles', Object.assign({
          updated_at: this.databaseService.getTimeStamp(),
        }, this.vehicleDatabaseObj(vehicle))
      )
      .where(condition);
  }

  private vehicleDatabaseObj(vehicle: VehicleApiInterface): VehicleInterface {
    return {
      id: vehicle.id,
      store_id: vehicle.store_id,
      vehicle_number: vehicle.vehicle_number,
      vin: vehicle.vin,
      plate: vehicle.plate,
      hash: vehicle.hash
    };
  }
}
