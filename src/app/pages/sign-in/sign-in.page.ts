import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { Router } from '@angular/router';
import { CredentialsInterface } from '@app/interfaces/credentials';
import { AlertController } from '@ionic/angular';
import { Device } from '@capacitor/device';
import { filter, take, map } from 'rxjs/operators';

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.page.html',
    styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {
    public credentials: CredentialsInterface = {
        username: null,
        password: null
    };

    deviceId = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private alertController: AlertController
    ) {
    }

    ngOnInit() {
    }

    async login() {
        try {
            const id = await Device.getId();
            this.deviceId = id.uuid;
        } catch (error) {
            this.deviceId = '-';
            console.log(error);
        }

        this.authService.login(this.credentials, this.deviceId)
            .then(async res => {
                console.log({ res });
                if (res) {
                    this.router.navigateByUrl('/', { replaceUrl: true });
                } else {
                    return this.loginFailed();
                }
            })
            .catch((err) => {
                console.log(err);
                this.loginFailed();
            });
    }

    private async loginFailed() {
        const alert = await this.alertController.create({
            header: 'Login Failed',
            message: 'Email address or password is wrong',
            buttons: [
                'Ok'
            ]
        });

        await alert.present();
    }
}
