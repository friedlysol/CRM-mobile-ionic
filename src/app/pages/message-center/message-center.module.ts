import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MessageCenterRoutingModule } from './message-center-routing.module';
import { MessageCenterFormPage } from '@app/pages/message-center/message-center-form/message-center-form.page';
import { MessageCenterListPage } from './message-center-list/message-center-list.page';
import { SharedModule } from '@app/shared.module';
import { NoteCardComponent } from './message-center-list/note-card/note-card.component';
import { MessageCardComponent } from './message-center-list/message-card/message-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MessageCenterRoutingModule,
    SharedModule,
  ],
  declarations: [
    MessageCenterFormPage,
    MessageCenterListPage,
    NoteCardComponent,
    MessageCardComponent,
  ]
})
export class MessageCenterModule {}
