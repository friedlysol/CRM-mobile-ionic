import {Component, OnInit} from '@angular/core';
import {environment} from '@env/environment';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
    public authBy: string = null;

    constructor() {
        this.authBy = environment.authBy;

        console.log('Auth by: ', this.authBy);
    }

    ngOnInit() {
    }
}
