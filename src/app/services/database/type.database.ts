import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { TypeInterface } from '@app/interfaces/type.interface';

import * as sqlBuilder from 'sql-bricks';
import { TypeApiInterface } from '@app/providers/api/interfaces/response-type-api.interface';

@Injectable({
  providedIn: 'root'
})
export class TypeDatabase {
  constructor(private databaseService: DatabaseService) {
  }

  /**
   * Get types by key
   *
   * @param key
   */
  getByKey(key: string): Promise<TypeInterface> {
    return this.databaseService
      .findOrNull(`select * from types where type_key = ?`, [key]);
  }

  /**
   * Get types by type name
   *
   * @param type
   */
  getByType(type: string): Promise<TypeInterface[]> {
    return this.databaseService
      .findAsArray(`select * from types where type = ? order by type_order asc, type_value asc`, [type]);
  }

  /**
   * Get types by type name
   *
   * @param types
   */
  getByTypes(types: Array<string>): Promise<TypeInterface[]> {
    const query = sqlBuilder
      .select()
      .from('types')
      .where(sqlBuilder.in('type', types));

    return this.databaseService.findAsArray(query.toString(), query.toParams());
  }

  getExistingTypesAsMap(): Promise<Record<number, string>> {
    const query = sqlBuilder
      .select('id', 'hash')
      .from('types');

    return this.databaseService
      .findAsArray(query.toString(), query.toParams())
      .then(types => {
        const typesMap = {};

        if (types && types.length) {
          types.forEach(type => typesMap[Number(type.id)] = type.hash);
        }

        return typesMap;
      });
  }

  getSqlForCreateFromApiData(type: TypeApiInterface) {
    return sqlBuilder.insert('types', this.typeDatabaseObj(type));
  }

  getSqlForUpdateFromApiData(type: TypeApiInterface, condition: { id: number }) {
    return sqlBuilder
      .update('types', this.typeDatabaseObj(type))
      .where(condition);
  }

  private typeDatabaseObj(type: TypeApiInterface): TypeInterface {
    return {
      id: type.id,
      type: type.type,
      type_key: type.type_key,
      type_value: type.type_value,
      type_order: type.orderby,
      type_color: type.color,
    };
  }
}
