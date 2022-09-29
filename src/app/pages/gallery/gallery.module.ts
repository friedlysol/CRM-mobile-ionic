import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryRoutingModule } from './gallery-routing.module';
import { GalleryListPage } from './gallery-list/gallery-list.page';
import { SharedModule } from '@app/shared.module';
import { IonicModule } from '@ionic/angular';
import { GalleryModalComponent } from './gallery-modal/gallery-modal.component';
import { HammerModule } from '@angular/platform-browser';
import { DocumentViewer } from '@awesome-cordova-plugins/document-viewer/ngx';

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
    HammerModule,
  ],
  exports: [
    GalleryListPage,
  ],
  providers: [
    DocumentViewer,
  ]
})
export class GalleryModule { }
