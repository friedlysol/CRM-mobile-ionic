import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '@app/components/header/header.component';
import { SyncComponent } from '@app/components/sync/sync.component';
import { SignatureComponent } from '@app/components/signature/signature.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { SignatureFormComponent } from '@app/components/signature/signature-form/signature-form.component';
import { SignatureCanvasComponent } from '@app/components/signature/signature-canvas/signature-canvas.component';
import { CaptureMediaComponent } from './components/capture-media/capture-media.component';
import { SideSwipeDirective } from './directives/side-swipe.directive';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    HeaderComponent,
    SyncComponent,
    SignatureComponent,
    SignatureFormComponent,
    SignatureCanvasComponent,
    CaptureMediaComponent,
    SideSwipeDirective,
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  exports: [
    HeaderComponent,
    SyncComponent,
    SignatureComponent,
    CaptureMediaComponent,
  ],
  providers: [
  ]
})
export class SharedModule { }
