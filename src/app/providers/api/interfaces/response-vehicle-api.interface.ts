export interface ResponseVehicleApiInterface {
  response: {
    vehicles: VehicleApiInterface[];
  };
}

export interface VehicleApiInterface {
  id: number;
  store_id: number;
  vehicle_number: string;
  vin: string;
  plate: string;
  hash: string;
}
