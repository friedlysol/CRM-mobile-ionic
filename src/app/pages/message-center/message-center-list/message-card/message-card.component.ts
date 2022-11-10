import { Component, Input, OnInit } from '@angular/core';
import { MessageInterface } from '@app/interfaces/message.interface';
import { MessagesDatabase } from '@app/services/database/messages.database';
import { UtilsService } from '@app/services/utils.service';
import { ModalController } from '@ionic/angular';
import { MessageCenterFormPage } from '../../message-center-form/message-center-form.page';

@Component({
  selector: 'app-message-card',
  templateUrl: './message-card.component.html',
  styleUrls: ['./message-card.component.scss'],
})
export class MessageCardComponent implements OnInit {
  @Input() message: MessageInterface;
  @Input() showComplete = true;
  @Input() showReply = true;

  constructor(
    private messagesDatabase: MessagesDatabase,
    private modalController: ModalController,
    public utilsService: UtilsService,
  ) { }

  ngOnInit() {}

  onCompleteClick(){
    this.messagesDatabase.complete(this.message);
    this.message.completed = 1;
  }

  async openFormModal() {
    const modal = await this.modalController.create({
      component: MessageCenterFormPage,
      componentProps: {
        isNote: false,
        person_id: this.message.from_person_id,
      },
      cssClass: 'popup',
      backdropDismiss: false,
    });

    await modal.present();
  }
}
