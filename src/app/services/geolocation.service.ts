import { Injectable } from '@angular/core';
import { StaticService } from '@app/services/static.service';
import { registerPlugin } from '@capacitor/core';

import { BackgroundGeolocationPlugin, Location } from '@capacitor-community/background-geolocation';
import { GeolocationDatabase } from '@app/services/database/geolocation.database';
import { SyncInterface } from '@app/interfaces/sync.interface';
import { GeolocationApi } from '@app/providers/api/geolocation-api';
import { ResponseGeolocationApiInterface } from '@app/providers/api/interfaces/response-geolocation-api.interface';

import * as moment from 'moment';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

@Injectable({
  providedIn: 'root'
})
export class GeolocationService implements SyncInterface {
  syncTitle = 'Geolocation';

  private watcherId: string = null;

  constructor(
    private geolocationApi: GeolocationApi,
    private geolocationDatabase: GeolocationDatabase,
    private staticService: StaticService
  ) {

  }

  async sync(): Promise<boolean> {
    const syncData = {
      gps_locations: await this.geolocationDatabase.getUnsynchronized(),
    };

    return this.geolocationApi.sync(syncData)
      .toPromise()
      .then(async (res: ResponseGeolocationApiInterface) => {
        if (syncData.gps_locations.length === res.response.total) {
          await this.geolocationDatabase.syncStatus(syncData.gps_locations.map(item => item.uuid));
        }

        return true;
      });
  }

  public async init() {
    await this.startWatch();
  }

  /**
   * Get current location
   */
  public getCurrentLocation(fromCache = false): Promise<Location | null> {
    if (this.staticService.location && this.staticService.location.time && fromCache) {
      if (moment(this.staticService.location.time).diff(moment.utc(), 'minutes') <= 1) {
        return Promise.resolve(this.staticService.location);
      }
    }

    return new Promise((resolve, reject) => {
      let lastLocation;

      return BackgroundGeolocation.addWatcher({
          requestPermissions: false,
          stale: true
        },
        (location) => {
          lastLocation = location || undefined;
        }
      ).then((id) => {
        setTimeout(async () => {
          await BackgroundGeolocation.removeWatcher({id});

          return resolve(lastLocation);
        }, 250);
      }).catch(err => reject(null));
    });
  }

  /**
   * Get current location as string
   */
  public async getCurrentLocationAsString(): Promise<string | null> {
    const currentLocation = await this.getCurrentLocation();

    let location = null;

    if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
      location = currentLocation.latitude + ',' + currentLocation.longitude;
    }

    return Promise.resolve(location);
  }

  async startWatch() {
    if (!this.watcherId) {
      this.watcherId = await BackgroundGeolocation.addWatcher(
        {
          // If the "backgroundMessage" option is defined, the watcher will
          // provide location updates whether the app is in the background or the
          // foreground. If it is not defined, location updates are only
          // guaranteed in the foreground. This is true on both platforms.

          // On Android, a notification must be shown to continue receiving
          // location updates in the background. This option specifies the text of
          // that notification.
          backgroundMessage: 'Location Service activated',

          // The title of the notification mentioned above. Defaults to "Using
          // your location".
          backgroundTitle: 'Location Tracker',

          // Whether permissions should be requested from the user automatically,
          // if they are not already granted. Defaults to "true".
          requestPermissions: true,

          // If "true", stale locations may be delivered while the device
          // obtains a GPS fix. You are responsible for checking the "time"
          // property. If "false", locations are guaranteed to be up to date.
          // Defaults to "false".
          stale: false,

          // The minimum number of metres between subsequent locations. Defaults
          // to 0.
          distanceFilter: 5
        }, async (location, error) => {
          if (error) {
            if (error.code === 'NOT_AUTHORIZED') {
              if (window.confirm(`This app needs your location, but does not have permission.\n\nOpen settings now?`)) {
                await BackgroundGeolocation.openSettings();
              }
            }
            return console.error('GeolocationService', error);
          }

          this.staticService.location = location;

          return this.geolocationDatabase.create(location);
        }
      );
    }
  }

  async stopWatch() {
    if (this.watcherId) {
      await BackgroundGeolocation.removeWatcher({
        id: this.watcherId
      });

      this.watcherId = null;
    }
  }
}
