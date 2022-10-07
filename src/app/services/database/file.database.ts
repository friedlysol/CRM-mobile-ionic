import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { FileInterface } from '@app/interfaces/file.interface';
import { UtilsService } from '@app/services/utils.service';
import { PrevNextInterface } from '@app/interfaces/prev-next.interface';
import { GeolocationService } from '@app/services/geolocation.service';

import * as sqlBuilder from 'sql-bricks';
import * as _ from 'underscore';


@Injectable({
  providedIn: 'root'
})
export class FileDatabase {
  private allowFields = [
    'crc',
    'description',
    'download_attempts',
    'is_deleted',
    'is_downloaded',
    'link_person_wo_id',
    'object_id',
    'object_type',
    'object_uuid',
    'path',
    'thumbnail',
    'type',
    'type_id',
    'sync',
    'sync_bg_status'
  ];

  constructor(
    private databaseService: DatabaseService,
    private geolocationService: GeolocationService
  ) {
  }

  /**
   * Get file by uuid
   *
   * @param uuid
   */
  getByUuid(uuid): Promise<FileInterface> {
    return this.databaseService
      .findOrNull(`select * from files where uuid = ?`, [uuid]);
  }

  /**
   * Get file by object_type, object_uuid and type_id
   *
   * @param objectType
   * @param objectUuid
   * @param typeId
   * @param linkPersonWoId
   */
  getByObjectAndType(
    objectType: string,
    objectUuid: string,
    typeId: number = null,
    linkPersonWoId: number = null,
  ): Promise<FileInterface[]> {
    let query = sqlBuilder
      .select('files.*')
      .from('files')
      .where('object_type', objectType)
      .where('object_uuid', objectUuid)
      .where('is_deleted', '0');

    if (typeId !== null) {
      query = query.where('type_id', typeId);
    }

    if (linkPersonWoId !== null) {
      query = query.where('link_person_wo_id', linkPersonWoId);
    }

    return this.databaseService
      .findAsArray(query.toString(), query.toParams());
  }

  getByObjectAndTypeSkipPdf(
    objectType: string,
    objectUuid: string,
  ): Promise<FileInterface[]> {
    return this.databaseService.findAsArray(`
      select *
      from files
      where 
        object_type = ? and
        object_uuid = ? and
        is_deleted = 0 and
        path not like '%.pdf'
      order by files.created_at desc
    `, [
      objectType,
      objectUuid,
    ]);
  }

  getByObjectAndTypeWithPagination(
    objectType: string,
    objectUuid: string,
    page: number,
    pageSize: number,
  ): Promise<FileInterface[]> {

    return this.databaseService.findAsArray(`
      select *
      from files
      where 
        files.object_type = ? and
        files.object_uuid = ? and
        is_deleted = 0
      order by files.created_at desc
      limit ?
      offset ?
    `, [
      objectType,
      objectUuid,
      pageSize,
      (page - 1) * pageSize
    ]);
  }

  /**
   * Create file in db
   *
   * @param file
   */
  async create(file: FileInterface): Promise<FileInterface> {
    const uuid = file.uuid || this.databaseService.getUuid();
    const currentLocation = await this.geolocationService.getCurrentLocationAsString();

    const query = sqlBuilder.insert('files', Object.assign({
        uuid,
        gps_coords: currentLocation,
        created_at: this.databaseService.getTimeStamp(),
        updated_at: null,
        sync: file.sync || 0,
      }, _.pick(file, this.allowFields))
    );

    return this.databaseService.query(query.toString(), query.toParams())
      .then(() => this.getByUuid(uuid));
  }

  /**
   * Update file in db
   *
   * @param file
   * @param uuid
   */
  async updateSyncBgStatus(file: FileInterface, uuid: string): Promise<FileInterface> {
    const query = sqlBuilder
      .update('files', Object.assign({
          updated_at: this.databaseService.getTimeStamp()
        }, _.pick(file, ['id', 'sync', 'sync_bg_status']))
      )
      .where('uuid', uuid);

    return this.databaseService.query(query.toString(), query.toParams())
      .then(() => this.getByUuid(uuid));
  }

  /**
   * Update file
   *
   * @param file
   */
  updateFile(file: FileInterface) {
    const query = sqlBuilder.update('files');
    Object.keys(file).forEach(field => {
      query.set(field, file[field]);
    });
    query.where('uuid', file.uuid);

    return this.databaseService.query(query.toString(), query.toParams());
  }

  /**
   * Mark file as deleted
   *
   * @param fileUuid
   */
  delete(fileUuid: string) {
    return this.databaseService
      .query(`update files set is_deleted = 0 where uuid = ?`, [fileUuid]);
  }

  /**
   * Remove file form database
   *
   * @param fileUuid
   */
  remove(fileUuid: string) {
    return this.databaseService
      .query(`delete from files where uuid = ?`, [fileUuid]);
  }

  async getUnSyncFiles() {
    return this.databaseService.findAsArray(`
      select * from files where sync = 0 and objectId is not null and url not like 'http%'
    `);
  }

  /**
   * Get prev and next uuid of files
   *
   * @param uuid
   */
  getPrevNextByUuid(uuid): Promise<PrevNextInterface | null> {
    return this.databaseService.findOrNull(`
        select
          (
            select uuid 
            from files 
            where 
              files.object_type = current.object_type and 
              files.object_uuid = current.object_uuid and 
              files.created_at < current.created_at and
              files.path not like '%.pdf' 
            order by files.created_at desc 
            limit 1
          ) as prev,
          (
            select uuid 
            from files 
            where 
              files.object_type = current.object_type and 
              files.object_uuid = current.object_uuid and 
              files.created_at > current.created_at and
              files.path not like '%.pdf'
            order by files.created_at asc 
            limit 1
          ) as next           
        from files as current
        where current.uuid = ?
      `, [
      uuid
    ]);
  }

  // /**
  //  * Create sql query as string
  //  *
  //  * @param address
  //  */
  // getSqlForCreateFromApiData(address: AddressApiInterface) {
  //   return sqlBuilder.insert('addresses', Object.assign({
  //     uuid: this.databaseService.getUuid(),
  //     created_at: this.databaseService.getTimeStamp(),
  //     updated_at: null,
  //     sync: 0
  //   }, this.addressDatabaseObj(address)));
  // }
  //
  // /**
  //  * Update sql query as string
  //  *
  //  * @param address
  //  */
  // getSqlForUpdateFromApiData(address: AddressApiInterface, condition = {}) {
  //   return sqlBuilder
  //     .update('addresses', this.addressDatabaseObj(address))
  //     .where(condition);
  // }
  //
  // /**
  //  * Get database object based on api response
  //  *
  //  * @param file
  //  * @private
  //  */
  // private fileDatabaseObj(file: FileApiInterface): FileInterface {
  //   return {
  //
  //   };
  // }


}
