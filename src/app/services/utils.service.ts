import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
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

  getLocalDatetime(dateUtc: string){
    return moment.utc(dateUtc).local().format(environment.datetimeFormat);
  }

  getLocalDate(dateUtc: string){
    return moment.utc(dateUtc).local().format(environment.dateFormat);
  }

  getDatesDifferenceInSeconds(startDate: string, endDate: string){
    return moment.duration(moment(endDate).diff(startDate)).asSeconds();
  }
}
