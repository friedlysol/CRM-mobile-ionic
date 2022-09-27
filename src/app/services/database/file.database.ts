import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { FileInterface } from '@app/interfaces/file.interface';
import { UtilsService } from '@app/services/utils.service';
import { PrevNextInterface } from '@app/interfaces/prev-next.interface';

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

  constructor(private databaseService: DatabaseService, private utilsService: UtilsService) {
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
   */
  getByObjectAndType(objectType: string, objectUuid: string, typeId: number, linkPersonWoId: number = null): Promise<FileInterface[]> {
    let query = sqlBuilder
      .select('files.*')
      .from('files')
      .where('object_type', objectType)
      .where('object_uuid', objectUuid)
      .where('type_id', typeId)
      .where('is_deleted', '0');

    if (linkPersonWoId !== null) {
      query = query.where('link_person_wo_id', linkPersonWoId);
    }

    return this.databaseService
      .findAsArray(query.toString(), query.toParams());
  }

  /**
   * Create file in db
   *
   * @param file
   */
  async create(file: FileInterface): Promise<FileInterface> {
    const uuid = file.uuid || this.databaseService.getUuid();

    const query = sqlBuilder.insert('files', Object.assign({
        uuid,
        gps_coords: this.utilsService.getCurrentCoords(),
        created_at: this.databaseService.getTimeStamp(),
        updated_at: null,
        sync: 0
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
  async update(file: FileInterface, uuid: string): Promise<FileInterface> {
    const query = sqlBuilder.update('files', Object.assign({
        updated_at: this.databaseService.getTimeStamp()
      }, _.pick(file, this.allowFields))
    );

    return this.databaseService.query(query.toString(), query.toParams())
      .then(() => this.getByUuid(uuid));
  }

  /**
   * Update thumbnail path
   *
   * @param file
   */
  updateThumbnail(file: FileInterface) {
    const query = sqlBuilder.update('files')
      .set('thumbnail', file.thumbnail)
      .where('uuid', file.uuid);

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
