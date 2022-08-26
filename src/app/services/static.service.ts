import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DatabaseService } from './database.service';
import { LoadingController, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class StaticService {
  public invalidToken = new BehaviorSubject<boolean | null>(null);
  public startSync = new BehaviorSubject<boolean | null>(null);

  public isFirstSync = true;
  public isTablet = !!navigator.userAgent.match(/iPad/i);

  private loading;

  constructor(
    private databaseService: DatabaseService,
    private platform: Platform,
    private loadingController: LoadingController
  ) {
    this.platform.ready().then(() => {
      this.isTablet = this.platform.is('tablet');


      console.log('isTablet', this.isTablet);
    });
  }

  async init() {

  }

  clearSyncStatus() {
    this.startSync.next(null);
  }

  async showLoader(message?: string, duration = 3000) {
    this.loading = await this.loadingController.create({message, duration});
    this.loading.present();
  }

  hideLoader() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  compareAppVersion(a, b) {
    const regExpStrip = /(\.0+)+$/;

    a = a.replace(regExpStrip, '').split('.');
    b = b.replace(regExpStrip, '').split('.');

    const minLength = Math.min(a.length, b.length);

    for (let index = 0; index < minLength; index++) {
      const diff = parseInt(a[index], 10) - parseInt(b[index], 10);
      if (diff) {
        return diff;
      }
    }
    return a.length - b.length;
  };
}
