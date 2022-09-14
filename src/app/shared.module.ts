import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '@app/components/header/header.component';
import { SyncComponent } from '@app/components/sync/sync.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SyncComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HeaderComponent,
    SyncComponent
  ],
  providers: [

  ]
})
export class SharedModule { }
