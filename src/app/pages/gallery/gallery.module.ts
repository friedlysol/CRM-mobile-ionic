import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryRoutingModule } from './gallery-routing.module';
import { GalleryListPage } from './gallery-list/gallery-list.page';
import { SharedModule } from '@app/shared.module';
import { IonicModule } from '@ionic/angular';
import { GalleryModalComponent } from './gallery-modal/gallery-modal.component';
import { HammerModule } from '@angular/platform-browser';


@NgModule({
  declarations: [
    GalleryListPage,
    GalleryModalComponent,
  ],
  imports: [
    CommonModule,
    GalleryRoutingModule,
    SharedModule,
    IonicModule,
  ],
  exports: [
    GalleryListPage,
  ]
})
export class GalleryModule { }
