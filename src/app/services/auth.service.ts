import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { CredentialsInterface } from '../interfaces/credentials';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

import { AuthApi } from '@app/providers/api/auth-api';
import { AccountsDatabase } from '@app/services/database/accounts.database';

const TOKEN_KEY = 'api-key';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public userToken = new BehaviorSubject(null);
  apiEndpoint: string = environment.apiEndpoint;

  constructor(
    private accountsDatabase: AccountsDatabase,
    private authApi: AuthApi,
    private http: HttpClient,
    private navCtrl: NavController,
    private platform: Platform,
    private router: Router,
    private storage: Storage,
  ) {
    this.loadStoredToken();
  }

  async loadStoredToken() {
    await this.platform.ready();

    const token = await this.storage.get(TOKEN_KEY);

    if (token) {
      this.userToken.next(token);
    } else {
      this.userToken.next(false);
    }
  }

  loginByDeviceIdOrImei(deviceId: string, imei: string = null) {
    return this.authApi.loginByDeviceIdOrImei(deviceId, imei)
      .toPromise()
      .then((res: any) => {
        // const personId = res?.data?.response?.user?.person_id;
        // const currentPersonId = Settings.getSetting('current_person_id', null);
        // const checkPersonId = parseInt(Settings.getSetting('app.check_person_id_last_signed_in', 1)) === 1;
      })
      .catch(err => {

      });
  }

  loginByEmail(credentials: CredentialsInterface, deviceId: string) {
    return this.authApi.loginByEmail(credentials, deviceId)
      .toPromise()
      .then(async (res: any) => {
        if (res && res.response.access_token) {
          await this.accountsDatabase.saveAccount({
            person_id: res.response.user.person_id,
            username: res.response.user.username,
            token: res.response.access_token
          });

          return this.setToken(res.response.access_token).then(x => true);
        } else {
          return false;
        }
      });
  }

  loginByPhoneNumber(deviceId: string, imei: string = null) {

  }

  logout(redirectTo = '/sign-in') {
    this.storage.remove(TOKEN_KEY)
      .then(() => {
        this.userToken.next(false);
        this.navCtrl.navigateRoot(redirectTo);
      });
  }

  getToken(): string {
    return this.userToken.getValue();
  }

  setToken(token): Promise<any> {
    return this.storage.set(TOKEN_KEY, token)
      .then(() => {
        this.userToken.next(token);

        return true;
      })
      .catch(err => {
        console.error('setToken', err);

        return false;
      });
  }
}
