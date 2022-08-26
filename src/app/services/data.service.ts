import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private storage: Storage) {
  }

  init() {
    this.storage.create();
  }
}
