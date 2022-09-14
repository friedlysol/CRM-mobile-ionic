import { Injectable } from '@angular/core';
import { SyncInterface } from '@app/interfaces/sync.interface';
import { MigrationsDatabase } from '@app/services/database/migrations.database';
import { SettingsDatabase } from '@app/services/database/settings.database';
import { SettingsApi } from '@app/providers/api/settings-api';
import { SettingsApiResponseInterface } from '@app/providers/api/interfaces/settings-api-response.interface';
import { TimeSheetTypesDatabase } from '@app/services/database/time-sheet-types.database';
import { PermissionsDatabase } from '@app/services/database/permissions.database';
import { PermissionInterface } from '@app/interfaces/permission-interface';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { StaticService } from '@app/services/static.service';
import { LoggerService } from '@app/services/logger.service';
import { DatabaseService } from '@app/services/database.service';
import { EventService } from '@app/services/event.service';
import { environment } from '@env/environment';

import * as moment from 'moment';
import * as _ from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class SettingsService implements SyncInterface {
  syncTitle = 'settings';

  constructor(
    private appVersion: AppVersion,
    private databaseService: DatabaseService,
    private loggerService: LoggerService,
    private migrationsDatabase: MigrationsDatabase,
    private permissionsDatabase: PermissionsDatabase,
    private settingsDatabase: SettingsDatabase,
    private timeSheetTypesDatabase: TimeSheetTypesDatabase,
    private settingsApi: SettingsApi,
    private staticService: StaticService
  ) {
  }

  /**
   * Sync settings with api
   */
  async sync(): Promise<boolean> {
    const lastMigrationId = await this.migrationsDatabase.getLastMigrationId();

    EventService.syncDetails.next({
      start: moment().toISOString(),
      title: this.syncTitle,
      total: 4,
      done: 0
    });

    return this.settingsApi.getSettings(lastMigrationId)
      .toPromise()
      .then(async (res: SettingsApiResponseInterface) => {

        await this.syncMigrations(res);

        EventService.syncDetailsDone.next(true);

        await this.syncSettings(res);

        EventService.syncDetailsDone.next(true);

        await this.syncPermissions(res);

        EventService.syncDetailsDone.next(true);

        await this.syncTimeSheetTypes(res);

        EventService.syncDetailsDone.next(true);

        EventService.endSync.next(true);

        return true;
      });
  }

  /**
   * Get setting
   *
   * @param key
   * @param defaultValue
   */
  get(key, defaultValue = null) {
    if (this.staticService.settings.hasOwnProperty(key)) {
      return (this.staticService.settings[key]);
    }

    return defaultValue;
  }

  /**
   * Create or update existing setting
   *
   * @param key
   * @param value
   * @param refresh
   */
  async set(key, value, refresh = true) {
    const setting = this.settingsDatabase.getByKey(key);

    try {
      if (setting) {
        await this.settingsDatabase.update(key, value);
      } else {
        await this.settingsDatabase.create(key, value);
      }
    } catch (err) {
      this.loggerService.error('Cannot save settings', err, {name: key, value, refresh});
    }

    if (refresh) {
      await this.refreshSettings();
    }
  };

  /**
   * Remove setting
   *
   * @param key
   */
  remove(key) {
    return this.settingsDatabase.remove(key);
  };

  /**
   * Get all settings
   */
  getAllSettings() {
    return this.settingsDatabase.getAllSettings();
  };

  /**
   * Refresh all settings in staticService
   */
  refreshSettings() {
    return this.settingsDatabase.getAllSettings()
      .then(dbSettings => {
        const settings = environment.settings || {};

        for (const key in dbSettings) {
          if (dbSettings.hasOwnProperty(key)) {
            let value = dbSettings[key];

            try {
              value = JSON.parse(value);
            } catch (e) {

            }

            if (!_.isObject(value)) {
              if (value === 'false') {
                value = false;
              } else if (value === 'true') {
                value = true;
              }
            }

            settings[key] = value;
          }
        }

        this.staticService.settings = settings;

        return settings;
      });
  };

  /**
   * Check value
   *
   * @param key
   * @param defaultValue
   */
  check(key, defaultValue) {
    return parseInt(this.get(key, defaultValue), 10) === 1;
  }

  /**
   * Sync settings
   *
   * @param res
   * @private
   */
  private async syncSettings(res: SettingsApiResponseInterface) {
    const settings = res?.response?.settings || {};

    if (!_.isEmpty(settings)) {


      const currentSettings = await this.settingsDatabase.getAllSettings();
      console.log(moment().toISOString(), currentSettings);

      const queries = [];

      for (const key in settings) {
        if (settings.hasOwnProperty(key)) {
          for (const subKey in settings[key]) {
            if (settings[key].hasOwnProperty(subKey)) {
              let value = settings[key][subKey];

              if (!Array.isArray(value) && typeof value === 'object') {
                value = JSON.stringify(value);
              }

              const name = key + '.' + subKey;

              if (value !== null && value !== true && value !== false) {
                value = value.toString();
              }

              try {
                if (!currentSettings.hasOwnProperty(name)) {
                  queries.push(this.settingsDatabase.getSqlForCreate(name, value));
                } else if (currentSettings[name] !== value) {
                  queries.push(this.settingsDatabase.getSqlForUpdate(name, value));
                }
              } catch (err) {
                this.loggerService.error('Cannot save settings', err, {name, value});
              }
            }
          }
        }
      }

      console.log(moment().toISOString(), queries);

      await this.databaseService.bulkQueries(queries);

      console.log(moment().toISOString());
    }
  }

  /**
   * Sync permissions
   *
   * @param res
   * @private
   */
  private async syncPermissions(res: SettingsApiResponseInterface) {
    const permissions = res?.response?.permissions || {};

    await this.permissionsDatabase.deleteAll();

    if (!_.isEmpty(permissions)) {
      const bulkPermissions: PermissionInterface[] = [];

      for (const key in permissions) {
        if (permissions.hasOwnProperty(key)) {
          bulkPermissions.push({
            name: key,
            access: permissions[key]
          });
        }
      }

      try {
        await this.permissionsDatabase.bulkCreate(bulkPermissions);
      } catch (err) {
        this.loggerService.error('Cannot save permissions', err, bulkPermissions);
      }
    }

    return true;
  }

  /**
   * Sync migrations
   *
   * @param res
   * @private
   */
  private async syncMigrations(res: SettingsApiResponseInterface) {
    const migrations = res?.response?.migrations || [];

    if (!_.isEmpty(migrations)) {
      const appVersion = this.appVersion.getVersionNumber();

      for (const migration of migrations) {
        const migrationAppVersion = migration.app_version;

        if (this.staticService.compareAppVersion(migrationAppVersion, appVersion) <= 0) {
          const migrationIsExists = await this.migrationsDatabase.isExists(migration.id);

          if (!migrationIsExists) {
            try {
              const sql: string = window.atob(migration.sql);

              this.databaseService.query(sql)
                .catch(err => this.migrationsDatabase.createError(migration.id, sql, err))
                .finally(() => this.migrationsDatabase.create(migration.id));
            } catch (err) {
              this.loggerService.error('Cannot get migration query', err, migration);
            }
          } else {
            console.log('[remote migration] ' + migration.id + ' already there');
          }
        }
      }
    }
  }

  /**
   * Sync time sheet types
   *
   * @param res
   * @private
   */
  private async syncTimeSheetTypes(res: SettingsApiResponseInterface) {
    const timeSheetTypes = res?.response?.time_sheet_types || [];

    await this.timeSheetTypesDatabase.deleteAll();

    if (!_.isEmpty(timeSheetTypes)) {
      try {
        await this.timeSheetTypesDatabase.bulkCreate(timeSheetTypes);
      } catch (err) {
        this.loggerService.error('Cannot save time sheet types', err, timeSheetTypes);
      }
    }
  }
}
