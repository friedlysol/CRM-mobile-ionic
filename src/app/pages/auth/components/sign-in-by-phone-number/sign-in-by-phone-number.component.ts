import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { AuthService } from '@app/services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from '@app/services/storage.service';
import { PhoneInterface } from '@app/interfaces/phone.interface';
import { SmsRetriever } from '@ionic-native/sms-retriever/ngx';

import { environment } from '@env/environment';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-sign-in-by-phone-number',
  templateUrl: './sign-in-by-phone-number.component.html',
  styleUrls: ['./sign-in-by-phone-number.component.scss'],
})
export class SignInByPhoneNumberComponent implements OnInit {
  public credentials: PhoneInterface = {
    countryCode: null,
    phoneNumber: null
  };

  public code = '';
  public confirmationCode = false;
  public countries = [];

  public isLoading = false;
  public showBackButton = false;

  private AUTH_COUNTRY_CODE = 'auth-country-code';
  private AUTH_PHONE_NUMBER = 'auth-phone-number';


  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private platform: Platform,
    private smsRetriever: SmsRetriever,
    private storageService: StorageService
  ) {
    this.countries = environment.countryCodes;
  }

  async ngOnInit() {
    this.credentials.countryCode = await this.storageService.get(this.AUTH_COUNTRY_CODE);
    this.credentials.phoneNumber = await this.storageService.get(this.AUTH_PHONE_NUMBER);

    if (!this.credentials.countryCode) {
      this.credentials.countryCode = this.countries[0].value;
    }
  }

  getCode() {
    setTimeout(() => {
      this.showBackButton = true;
    }, 20000);

    this.startSmsRetriever();

    this.authService.getConfirmationCode(this.credentials)
      .toPromise()
      .then(() => {
        this.confirmationCode = true;
      })
      .catch(async err => {
        this.showBackButton = true;

        const alert = await this.alertController.create({
          header: 'Login Failed',
          message: 'Incorrect phone number',
          buttons: ['Ok']
        });

        await alert.present();
      });
  }

  checkCodeLength() {
    if (this.code.length === 6) {
      Keyboard.hide();
    }
  }

  verificationCode() {
    const phoneNumber = this.credentials.countryCode + this.credentials.phoneNumber;

    this.isLoading = true;

    this.authService.loginByPhoneNumber(phoneNumber, this.code)
      .then(async res => {
        this.isLoading = false;

        if (res) {
          await this.router.navigateByUrl('/', {replaceUrl: true});
        } else {
          return this.incorrectCode();
        }
      })
      .catch(async (err) => {
        this.isLoading = false;

        return this.incorrectCode();
      });
  }

  back() {
    this.showBackButton = false;
    this.confirmationCode = false;
  }

  private startSmsRetriever() {
    if (!this.platform.is('android')) {
      return false;
    }

    this.smsRetriever.startWatching()
      .then((res: any) => {

        if (res?.Message) {
          const confirmationCode = res.Message.match(/\d{6}/);

          console.log('b', confirmationCode, res.Message);
          if (confirmationCode[0] && confirmationCode[0].length === 6) {
            this.code = confirmationCode[0];
          }
        }
      })
      .catch((error: any) => console.error(error));
  }

  private async incorrectCode() {
    const alert = await this.alertController.create({
      header: 'Login Failed',
      message: 'Verification code is incorrect',
      buttons: ['Ok']
    });

    await alert.present();
  }
}
