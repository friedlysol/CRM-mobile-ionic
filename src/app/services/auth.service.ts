import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { CredentialsInterface } from '../interfaces/credentials';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';

const TOKEN_KEY = 'api-key';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public userToken = new BehaviorSubject(null);
  apiEndpoint: string = environment.apiEndpoint;

  constructor(private http: HttpClient, private navCtrl: NavController,
    private storage: Storage, private platform: Platform, private router: Router) {
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

  login(credentials: CredentialsInterface, deviceId: string) {
    const props: any = credentials;
    props.grant = 'password';
    props.is_new_crm = 1;
    props.is_mobile = 1;
    props.device_id = deviceId;
    return this.http.post(`${this.apiEndpoint}auth/token`, props).toPromise()
      .then((res: any) => {
        console.log(res, res.response.access_token);
        if (res && res.response.access_token) {
          return this.setToken(res.response.access_token).then(x => true);
        }

        return false;
      });
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
