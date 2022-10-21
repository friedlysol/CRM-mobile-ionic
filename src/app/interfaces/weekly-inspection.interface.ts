export interface WeeklyInspectionInterface {
  uuid?: string;
  id?: number;
  route?: string;
  vehicle_number?: string;
  odometer_reading?: string;
  oil: boolean;
  brake: boolean;
  washer: boolean;
  jack: boolean;
  tread: boolean;
  spare_tire: boolean;
  tires_pressure_front_driver: number;
  tires_pressure_front_passenger: number;
  tires_pressure_rear_driver: number;
  tires_pressure_rear_passenger: number;
  card_in_vehicle: boolean;
  registration_in_vehicle: boolean;
  sync?: number;
  created_at?: string;
  updated_at?: string;
}
