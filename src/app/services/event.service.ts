import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ConnectionStatus } from '@capacitor/network';
import { SyncDetailsInterface } from '@app/interfaces/sync.details.interface';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  static networkStatus = new Subject<ConnectionStatus>();

  static startSync = new Subject<boolean | null>();
  static syncInProgress = new Subject<boolean | null>();
  static syncDetails = new Subject<SyncDetailsInterface | null>();
  static syncDetailsDone = new Subject<boolean | null>();
  static endSync = new Subject<boolean | null>();

  static databaseIsOpen = new Subject<boolean | null>();
  static databaseIsClosed = new Subject<boolean | null>();

  static newMessages = new Subject<number | 0>();

  constructor() {
  }
}
