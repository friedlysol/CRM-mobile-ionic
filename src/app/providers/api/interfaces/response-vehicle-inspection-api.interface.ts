import { SyncApiInterface } from '@app/providers/api/interfaces/sync-api.interface';
import { DailyInspectionInterface } from '@app/interfaces/daily-inspection.interface';

export interface ResponseVehicleInspectionApiInterface {
  response: {
    syncs: {
      daily_inspections: SyncApiInterface[],
      weekly_inspections: SyncApiInterface[]
    },
    daily_inspections: VehicleDailyInspectionApiInterface[]
  };
}

export interface VehicleDailyInspectionApiInterface extends DailyInspectionInterface {

}
