import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { File } from '@ionic-native/file/ngx';
import { UUID } from 'angular2-uuid';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

import * as moment from 'moment';
import * as sqlBuilder from 'sql-bricks';
import { HashMapInterface } from '@app/interfaces/hash-map.interface';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  public static dbName = 'database.db';
  protected sqlBuilder = null;
  private db: SQLiteObject;

  constructor(private file: File, private sqLite: SQLite) {

  }

  public init() {
    return this.sqLite.create({
      name: DatabaseService.dbName,
      location: 'default'
    }).then((db) => {
      this.db = db;
      return this.query('CREATE TABLE IF NOT EXISTS `migrations` (`name` text, `migrated_at` text);');
    }).then(() => this.migrations()).then(() => {
      console.log('Database initiated');
    }).catch((err) => {
      console.error('Error while initializing the database', err);
    });
  }

  public query(query, parameters?): Promise<any> {
    if (query.toString()) {
      query = query.toString();
    }

    parameters = parameters || [];

    console.log('Database query', query, parameters);

    return this.db.executeSql(query, parameters)
      .catch(err => {
        console.error('Database error', err, query, parameters);

        return {rows: [], error: err};
      });
  }

  bulkQueries(queries: any[]) {
    return this.db.sqlBatch(queries);
  }

  public get(result) {
    return {...result.rows.item(0)};
  }

  public getAll(result) {
    const output = [];

    for (let i = 0; i < result.rows.length; i++) {
      output.push(result.rows.item(i));
    }

    return output;
  }

  public getUuid() {
    return UUID.UUID();
  }

  getTimeStamp() {
    return moment().utc().format('YYYY-MM-DD HH:mm:ss');
  }

  public findOrNull(query: any, parameters?: any) {
    return this.query(query, parameters)
      .then((result) => {
        if (result.rows.length) {
          return this.get(result);
        }

        return null;
      });
  }

  public findAsArray(query: any, parameters?: any) {
    return this.query(query, parameters)
      .then((results) => this.getAll(results)
      );
  }

  public closeDatabase(){
    return this.db.close().catch(() => {
      console.log('database is already closed');
    });
  }

  public openDatabase(){
    return this.db.open().catch(() => {
      console.log('database is not open');
    });
  }

  public async getDatabaseFile(){
    const databaseFile = await Filesystem.readFile({
      path: `../databases/${DatabaseService.dbName}`,
      directory: Directory.Data,
    });

    return databaseFile.data;
  }

  private async migrations() {
    const newMigrationFiles = await this.getNewMigrationFiles();

    if (newMigrationFiles) {
      for (const filename of newMigrationFiles) {
        await this.parseMigrationFile(filename);
      }
    }

    return true;
  }

  private getNewMigrationFiles(): Promise<string[]> {
    const newMigrationFiles = [];

    return this.findAsArray('select * from migrations')
      .then((completedMigrations) => this.file.listDir(this.file.applicationDirectory, 'public/assets/migrations')
        .then(files => {
          files.forEach((file) => {
            if (!completedMigrations.map(item => item.name).includes(file.name)) {
              newMigrationFiles.push(file.name);
            }
          });
        })
        .then(() => newMigrationFiles.sort()));
  }

  private parseMigrationFile(filename: string): Promise<any> {
    console.log('parseMigrationFile', filename);

    return fetch('assets/migrations/' + filename)
      .then(content => content.text())
      .then(content => {
        console.log('content', content);

        const queries = content.split(';\n').map(item => item.trim()).filter(item => item);

        console.log('queries', queries);

        return this.db.sqlBatch(queries)
          .then(result => {
            console.log('Migration ' + filename + ' -> success', result);
          }).catch(err => {
            console.error('Migration ' + filename, err);
          });
      })
      .then(() => this.query(
        `insert into migrations (name, migrated_at) values (?, ?)`, [filename, this.getTimeStamp()])
      )
      .catch((err) => {
        console.error('Migration query', err);
      });
  }

  getUnSynchronized(tableName: string) {
    const query = sqlBuilder
      .select()
      .from(tableName)
      .where('sync', 0)

    return this.findAsArray(query.toString(), query.toParams());
  }

  getHashes(tableName: string, columnName = 'id'): Promise<Record<number, string>> {
    const query = sqlBuilder
      .select(columnName, 'hash')
      .from(tableName)
      .where(sqlBuilder.isNotNull('hash'));

    return this
      .findAsArray(query.toString(), query.toParams())
      .then(result => {
        const hashMapped = {};

        result.map(item => hashMapped[item[columnName]] = item.hash);

        return hashMapped;
      });
  }


  /**
   * Get map with uuid and hash
   *
   * @param ids
   * @param tableName
   * @param idColumnName
   */
  getExistingRecordsAsMap(ids: number[], tableName, idColumnName = 'id'): Promise<Record<string, HashMapInterface>> {
    if (ids && Array.isArray(ids) && ids.length) {
      const query = sqlBuilder
        .select('uuid', idColumnName, 'hash')
        .from(tableName)
        .where(sqlBuilder.in(idColumnName, ...ids));

      return this.findAsArray(query.toString(), query.toParams())
        .then(billEntries => {
          const billEntriesMap = {};

          if (billEntries && billEntries.length) {
            billEntries.forEach(billEntry => billEntriesMap[Number(billEntry[idColumnName])] = {
              hash: billEntry.hash,
              uuid: billEntry.uuid
            });
          }

          return billEntriesMap;
        });
    }

    return Promise.resolve({});
  }
}
