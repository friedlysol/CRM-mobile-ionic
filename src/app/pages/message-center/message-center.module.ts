import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MessageCenterRoutingModule } from './message-center-routing.module';
import { MessageCenterListPage } from './components/message-center-list/message-center-list.page';
import { SharedModule } from '@app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessageCenterRoutingModule,
    SharedModule,
  ],
  declarations: [MessageCenterListPage]
})
export class MessageCenterModule {}
