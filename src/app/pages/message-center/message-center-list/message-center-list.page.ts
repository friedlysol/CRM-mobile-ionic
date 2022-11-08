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
import { TabInterface } from '@app/interfaces/tab.interface';

@Component({
  selector: 'app-message-center-list',
  templateUrl: './message-center-list.page.html',
  styleUrls: ['./message-center-list.page.scss'],
})
export class MessageCenterListPage implements OnInit {
  public objectType: string;
  public objectUuid: string;
  public objectId: number;

  public isNote = false;

  public messages: MessageInterface[] = [];
  public pagination?: PaginationInterface;
  public title: string = "";

  public params: any = {
    query: ''
  };

  public tabs: TabInterface[] = [{
    key: 'new',
    label: "New",
    isActive: true,
    icon: 'document-text-outline'
  }, {
    key: 'completed',
    label: "Completed",
    isActive: false,
    icon: 'checkmark-done-circle-outline'
  }, {
    key: 'sent',
    label: 'Sent',
    isActive: false,
    icon: 'send-outline'
  }];

  constructor(
    private activatedRoute: ActivatedRoute,
    private messagesService: MessagesService,
    private modalController: ModalController,
    private router: Router,
    public utilsService: UtilsService
  ) {
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params) {
        this.params = Object.assign({}, params);
      }

      if (this.params.hasOwnProperty('tab')) {
        this.setActiveTab(this.params.tab, false);

        this.loadList();
      }
    });

    this.activatedRoute.queryParamMap.subscribe(async params => {
      if (params) {
        this.params = Object.assign({}, params);
      }

      this.objectType = params.get('objectType');
      this.objectUuid = params.get('objectUuid');
      this.objectId = Number(params.get('objectId'));

      this.isNote = !!this.objectType;
      this.title = this.objectType
        ? 'Notes'
        : 'Message center';

      if (this.params.hasOwnProperty('tab')) {
        this.setActiveTab(this.params.tab, false);

        await this.loadList();
      }
    });
  }

  async ionViewDidEnter() {
    await this.loadList()
  }

  public async loadList(page = 1) {
    const message = await this.messagesService.getMessagesWithPagination(
      this.getActiveTabKey(), this.objectType, this.objectUuid, page, this.params.query
    );

    this.messages = message.messages;
    this.pagination = message.pagination;
  }

  async openFormModal() {
    const modal = await this.modalController.create({
      component: MessageCenterFormPage,
      componentProps: {
        isNote: this.isNote
      },
      cssClass: 'popup',
      backdropDismiss: false,
    });

    await modal.present();

    modal.onDidDismiss().then((res) => {
      if (res.role === 'submit') {
        if(!this.isNote && this.getActiveTabKey() !== 'sent') {
          this.setActiveTab('sent');
        } else {
          this.messages.unshift(res.data);
        }
      }
    });
  }

  getActiveTabKey(): string {
    const activeTabs = this.tabs.filter(tab => tab.isActive);

    if (activeTabs.length) {
      return activeTabs[0].key;
    }

    return null;
  }

  setActiveTab(selectedTabKey, withUpdateParams = true) {
    this.tabs.map(tab => tab.isActive = tab.key === selectedTabKey);

    this.params.tab = selectedTabKey;

    if (withUpdateParams) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: this.params,
        queryParamsHandling: 'merge', // remove to replace all query params by provided
        replaceUrl: true
      });
    }
  }
}
