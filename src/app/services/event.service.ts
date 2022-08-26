import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  static startSync = new Subject<boolean | null>();
  static syncInProgress = new Subject<boolean | null>();

  constructor() {
  }
}
