import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import * as moment from 'moment';
import { PaginationInterface } from '@app/interfaces/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor() {
  }

  is(company) {
    return environment.company === company;
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

  getPagination(total: any, page: number, limit: number): PaginationInterface {
    return {
      total: total,
      totalPages: Math.round(total / limit),
      page: page,
      limit: limit,
      prev: page > 1,
      next: page < Math.round(total / limit)
    }
  }

  getLastnameFromFullname(fullName: string){
    const splited = fullName.split(' ');
    return splited[splited.length-1];
  }
}
