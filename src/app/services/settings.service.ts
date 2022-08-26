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

import * as _ from 'underscore';
import { DatabaseService } from '@app/services/database.service';


@Injectable({
  providedIn: 'root'
})
export class SettingsService implements SyncInterface {

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

  async sync(): Promise<boolean> {
    const lastMigrationId = await this.migrationsDatabase.getLastMigrationId();

    return this.settingsApi.getSettings(lastMigrationId)
      .toPromise()
      .then(async (res: SettingsApiResponseInterface) => {
        await this.syncSettings(res);
        await this.syncPermissions(res);
        await this.syncMigrations(res);
        await this.syncTimeSheetTypes(res);

        return true;
      });
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

              const queries = [];

              try {
                if (!currentSettings.hasOwnProperty(name)) {
                  queries.push(this.settingsDatabase.getSqlForCreate(name, value));
                } else if (currentSettings[name] !== value) {
                  queries.push(this.settingsDatabase.getSqlForUpdate(name, value));
                }

                this.databaseService.bulkQueries(queries);
              } catch (err) {
                this.loggerService.error('Cannot save settings', err, {name, value});
              }
            }
          }
        }
      }
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
