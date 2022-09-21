import { Injectable } from '@angular/core';

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
}
