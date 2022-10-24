import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor() {
  }

  getHashMap(data, idColumnName = 'id', hashColumnName = 'hash') {
    const hashMap = {};

    if (data && Array.isArray(data)) {
      data.forEach(row => {
        if (row.hasOwnProperty(idColumnName) && row.hasOwnProperty(hashColumnName)) {
          hashMap[data[idColumnName]] = data[hashColumnName];
        }
      });
    }

    return hashMap;
  }

  getCurrentCoords() {
    //ToDo: get coords from gps

    return '';
  }

  getLocalDate(date: string){
    return moment.utc(date).local().format('YYYY-MM-DD HH:mm:ss');
  }
}
