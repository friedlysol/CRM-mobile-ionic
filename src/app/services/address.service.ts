import { Injectable } from '@angular/core';
import { ResponseWorkOrderApiInterface } from '@app/providers/api/interfaces/response-work-order-api.interface';
import { AddressDatabase } from '@app/services/database/address.database';
import { DatabaseService } from '@app/services/database.service';
import { EventService } from '@app/services/event.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  syncTitle = 'addresses';

  constructor(
    private addressDatabase: AddressDatabase,
    private databaseService: DatabaseService
  ) {
  }

  /**
   * Sync addresses
   *
   * @param res
   */
  async syncAddresses(res: ResponseWorkOrderApiInterface) {
    if (res?.response?.addresses?.length) {
      EventService.syncDetails.next({
        start: moment().toISOString(),
        title: this.syncTitle,
        total: res.response.addresses.length,
        done: 0
      });

      // get address ids from api response
      const addressIds = res.response.addresses.map(address => address.address_id);

      // get existing addresses map from app db
      const existingAddressesHashMap = await this.addressDatabase.getExistingAddressesAsMap(addressIds);

      const queue = [];

      res.response.addresses.forEach(address => {
        const addressId = Number(address.address_id);

        let query = null;

        if (existingAddressesHashMap.hasOwnProperty(addressId)) {
          const existingAddress = existingAddressesHashMap[address.address_id];

          if (address.hash !== existingAddress.hash) {
            query = this.addressDatabase.getSqlForUpdateFromApiData(address, {uuid: existingAddress.uuid});
          }
        } else {
          query = this.addressDatabase.getSqlForCreateFromApiData(address);
        }

        if (query) {
          queue.push(query);
        }
      });

      console.log('syncAddresses', queue);

      return this.databaseService.bulkQueries(queue);
    }

    return Promise.resolve({});
  }
}
