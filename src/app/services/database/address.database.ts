import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { HashMapInterface } from '@app/interfaces/hash-map.interface';
import * as sqlBuilder from 'sql-bricks';
import { AddressApiInterface } from '@app/providers/api/interfaces/address-api.interface';
import { AddressInterface } from '@app/interfaces/address.interface';


@Injectable({
  providedIn: 'root'
})
export class AddressDatabase {
  constructor(private databaseService: DatabaseService) {
  }

  /**
   * Get map with uuid and hash
   *
   * @param addressIds
   */
  getExistingAddressesAsMap(addressIds): Promise<Record<string, HashMapInterface>> {
    if (addressIds && Array.isArray(addressIds) && addressIds.length) {
      const query = sqlBuilder
        .select('uuid', 'id', 'hash')
        .from('addresses')
        .where(sqlBuilder.in('id', ...addressIds));

      return this.databaseService
        .findAsArray(query.toString(), query.toParams())
        .then(addresses => {
          const addressMap = {};

          if (addresses && addresses.length) {
            addresses.forEach(address => addressMap[Number(address.id)] = {
              hash: address.hash,
              uuid: address.uuid
            });
          }

          return addressMap;
        });
    }

    return Promise.resolve({});
  }

  /**
   * Remove address from db
   *
   * @param key
   */
  remove(key) {
    return this.databaseService.query(`delete from addresses where id = ?`, [key]);
  }

  /**
   * Create sql query as string
   *
   * @param address
   */
  getSqlForCreateFromApiData(address: AddressApiInterface) {
    return sqlBuilder.insert('addresses', Object.assign({
      uuid: this.databaseService.getUuid(),
      created_at: this.databaseService.getTimeStamp(),
      updated_at: null,
      sync: 0
    }, this.addressDatabaseObj(address)));
  }

  /**
   * Update sql query as string
   *
   * @param address
   */
  getSqlForUpdateFromApiData(address: AddressApiInterface, condition = {}) {
    return sqlBuilder
      .update('addresses', this.addressDatabaseObj(address))
      .where(condition);
  }

  /**
   * Get database object based on api response
   *
   * @param address
   * @private
   */
  private addressDatabaseObj(address: AddressApiInterface): AddressInterface {
    return {
      id: address.address_id,
      address: address.address,
      address2: address.address2 || null,
      address_name: address.address_name || null,
      address_note: address.address_note || null,
      address_store_hours: address.address_store_hours ? JSON.stringify(address.address_store_hours) : null,
      city: address.city || null,
      state: address.state || null,
      zip_code: address.zip_code || null,
      latitude: address.latitude || null,
      longitude: address.longitude || null,
      hash: address.hash || null,
    };
  }
}
