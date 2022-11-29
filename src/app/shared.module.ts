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
import { YesOrNoOptionsComponent } from './components/yes-or-no-options/yes-or-no-options.component';
import { FormSelectComponent } from '@app/components/form-select/form-select.component';
import { OrderModule } from 'ngx-order-pipe';
import { ItemValueComponent } from '@app/components/item-value/item-value.component';
import { PartRequestComponent } from '@app/modals/part-request/part-request.component';
import { LaborRequestComponent } from '@app/modals/labor-request/labor-request.component';
import { ErrorTextComponent } from '@app/components/error-text/error-text.component';
import { SelectOnClickDirective } from '@app/directives/select-on-click.directive';
import { DetectFocusDirective } from '@app/directives/detect-focus.directive';

@NgModule({
  declarations: [
    CaptureMediaComponent,
    DetectFocusDirective,
    ErrorTextComponent,
    FormSelectComponent,
    HeaderComponent,
    ItemValueComponent,
    LaborRequestComponent,
    PartRequestComponent,
    SelectOnClickDirective,
    SideSwipeDirective,
    SignatureCanvasComponent,
    SignatureComponent,
    SignatureFormComponent,
    SyncComponent,
    YesOrNoOptionsComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule,
    OrderModule,
  ],
  exports: [
    CaptureMediaComponent,
    DetectFocusDirective,
    ErrorTextComponent,
    FormSelectComponent,
    HeaderComponent,
    ItemValueComponent,
    LaborRequestComponent,
    PartRequestComponent,
    SelectOnClickDirective,
    SignatureComponent,
    SyncComponent,
    YesOrNoOptionsComponent,
  ],
  providers: [
  ]
})
export class SharedModule { }
