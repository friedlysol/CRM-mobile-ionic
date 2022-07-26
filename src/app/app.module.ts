import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy, Platform} from '@ionic/angular';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {SQLite} from '@ionic-native/sqlite/ngx';

import {ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';

import {ApiInterceptor} from '@app/providers/api.interceptor';

import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import {IonicStorageModule} from '@ionic/storage-angular';
import {Drivers} from '@ionic/storage';
import {OrderModule} from 'ngx-order-pipe';

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        HttpClientModule,
        HttpClientJsonpModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot({
            name: 'aspen-database',
            // eslint-disable-next-line no-underscore-dangle
            driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
        }),
        AppRoutingModule,
        OrderModule,
        ReactiveFormsModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ApiInterceptor,
            multi: true
        },
        {
            provide: RouteReuseStrategy,
            useClass: IonicRouteStrategy
        },
        SQLite,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
