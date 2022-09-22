import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '@app/components/header/header.component';
import { SyncComponent } from '@app/components/sync/sync.component';
import { SignatureComponent } from '@app/components/signature/signature.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { SignatureFormComponent } from '@app/components/signature/signature-form/signature-form.component';
import { SignatureCanvasComponent } from '@app/components/signature/signature-canvas/signature-canvas.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SyncComponent,
    SignatureComponent,
    SignatureFormComponent,
    SignatureCanvasComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
  ],
  exports: [
    HeaderComponent,
    SyncComponent,
    SignatureComponent,
  ],
  providers: [
    ScreenOrientation
  ]
})
export class SharedModule { }
