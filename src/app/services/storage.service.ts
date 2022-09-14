import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private storage: Storage) {
  }

  init() {
    this.storage.create();
  }

  /** Saves data to storage */
  async set(key: string, value) {
    return this.storage.set(key, value);
  }

  /** Loads data from storage */
  async get(key: string) {
    return this.storage.get(key);
  }

  /** Removes data from storage */
  async remove(key: string) {
    return this.storage.remove(key);
  }
}
