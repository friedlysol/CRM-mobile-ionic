import { TimeSheetTypeInterface } from '@app/interfaces/time-sheet-type.interface';

export interface SettingsApiResponseInterface {
  response: {
    settings: Record<string, Record<string, any>>;
    permissions: Record<string, number>;
    migrations: SettingsApiMigrationInterface[];
    time_sheet_types: TimeSheetTypeInterface[];
    user_data: Record<string, any>;
  };
}

export interface SettingsApiMigrationInterface {
  id: number;
  app_version: string;
  sql: string;
}
