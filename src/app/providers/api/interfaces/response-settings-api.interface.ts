import { TimeSheetTypeInterface } from '@app/interfaces/time-sheet-type.interface';

export interface ResponseSettingsApiInterface {
  response: {
    migrations: SettingsApiMigrationInterface[];
    permissions: Record<string, number>;
    settings: Record<string, Record<string, any>>;
    time_sheet_types: TimeSheetTypeInterface[];
    user_data: Record<string, any>;
  };
}

export interface SettingsApiMigrationInterface {
  app_version: string;
  id: number;
  sql: string;
}
