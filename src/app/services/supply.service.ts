import { Injectable } from '@angular/core';
import { SupplyInterface } from '@app/interfaces/supply.interface';
import { SupplyDatabase } from './database/supply.database';

@Injectable({
    providedIn: 'root'
})
export class SupplyService{

    constructor(
        private supplyDatabase: SupplyDatabase,
    ){}

    getAllByDeliveryStatus(deliveryStatusKey: string): Promise<SupplyInterface[]>{
        if(deliveryStatusKey === 'not_confirmed'){
            return this.supplyDatabase.getAllByAcknowledgment(0);
        }

        return this.supplyDatabase.getAllByDeliveryStatus(deliveryStatusKey);
    }
}
