import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { Location } from '@capacitor-community/background-geolocation';

import * as sqlBuilder from 'sql-bricks';

@Injectable({
  providedIn: 'root'
})
export class GeolocationDatabase {

  constructor(private databaseService: DatabaseService) {
  }

  /**
   * Get unsynchronized gps locations
   */
  public getUnsynchronized(): Promise<any> {
    return this.databaseService.query(`select * from gps_locations where sync = 0`);
  }

  public async syncStatus(uuids: Array<string>) {
    if (uuids.length) {
      const query = sqlBuilder
        .update('gps_locations', {sync: 1})
        .where(sqlBuilder.in('uuid', uuids));

      return this.databaseService.query(query.toString(), query.toParams());
    }

    return Promise.resolve(null);
  }

  /**
   * Create log
   *
   * @private
   * @param location
   */
  public async create(location: Location): Promise<any> {
    const query = sqlBuilder.insert('gps_locations', {
      uuid: this.databaseService.getUuid(),
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      altitude: location.altitude,
      altitude_accuracy: location.altitudeAccuracy,
      bearing: location.bearing,
      speed: location.speed,
      simulated: location.simulated,
      timestamp: location.time / 1000,
      sync: 0
    });

    return this.databaseService.query(query.toString(), query.toParams());
  }

}
