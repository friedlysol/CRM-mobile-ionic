import { Component, OnInit } from '@angular/core';
import { MediaOptionsInterface } from '@app/interfaces/media-options.interface';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SuppliesRequestFormComponent
} from '@app/pages/supplies-request/supplies-request-form/supplies-request-form.component';
import { ModalController } from '@ionic/angular';
import { MessageCenterFormPage } from '@app/pages/message-center/message-center-form/message-center-form.page';
import { MessageInterface } from '@app/interfaces/message.interface';
import { MessagesDatabase } from '@app/services/database/messages.database';
import { MessagesService } from '@app/services/messages.service';
import { PaginationInterface } from '@app/interfaces/pagination.interface';
import { UtilsService } from '@app/services/utils.service';

@Component({
  selector: 'app-message-center-list',
  templateUrl: './message-center-list.page.html',
  styleUrls: ['./message-center-list.page.scss'],
})
export class MessageCenterListPage implements OnInit {
  public objectType: string;
  public objectUuid: string;
  public objectId: number;

  params: any = {
    query: ''
  };

  public messages: MessageInterface[] = [];
  public pagination?: PaginationInterface;
  public title: string = "";

  constructor(
    private activatedRoute: ActivatedRoute,
    private messagesService: MessagesService,
    private modalController: ModalController,
    public utilsService: UtilsService
  ) {
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(async params => {
      this.objectType = params.get('objectType');
      this.objectUuid = params.get('objectUuid');
      this.objectId = Number(params.get('objectId'));

      this.title = this.objectType
        ? 'Notes'
        : 'Message center';
    });
  }

  async ionViewDidEnter() {
    await this.loadList()
  }

  private async loadList(page = 1) {
    const message = await this.messagesService.getMessagesWithPagination(
      null, this.objectType, this.objectUuid, page, this.params.query
    );

    this.messages = message.messages;
    this.pagination = message.pagination;
  }

  async openFormModal() {
    const modal = await this.modalController.create({
      component: MessageCenterFormPage,
      cssClass: 'popup',
      backdropDismiss: false
    });

    await modal.present();

    modal.onDidDismiss().then((res) => {
      if (res.role === 'submit') {
        this.messages.unshift(res.data);
      }
    });
  }
}
