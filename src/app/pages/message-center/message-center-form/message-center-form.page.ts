import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessagesService } from '@app/services/messages.service';
import { ModalController } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '@app/services/database.service';
import { MessageInterface } from '@app/interfaces/message.interface';
import { MessagesDatabase } from '@app/services/database/messages.database';

@Component({
  selector: 'app-message-center-form',
  templateUrl: './message-center-form.page.html',
  styleUrls: ['./message-center-form.page.scss'],
})
export class MessageCenterFormPage implements OnInit {
  public objectType: string;
  public objectUuid: string;
  public objectId: number;

  public uuid: string;
  public form: FormGroup;
  public type: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private databaseService: DatabaseService,
    private messagesDatabase: MessagesDatabase,
    private messagesService: MessagesService,
    private modalController: ModalController
  ) {
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(async params => {
      this.objectType = params.get('objectType');
      this.objectUuid = params.get('objectUuid');
      this.objectId = Number(params.get('objectId'));

      this.type = this.objectType
        ? 'activity'
        : 'calendar_event';
    });

    this.uuid = this.databaseService.getUuid();

    this.initForm();
  }

  get description() {
    return this.form.get('description');
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const message = await this.messagesDatabase.create({
      uuid: this.uuid,
      type: this.type,
      object_type: this.objectType,
      object_uuid: this.objectUuid,
      object_id: this.objectId,
      description: this.description.getRawValue()
    } as MessageInterface);

    await this.modalController.dismiss(message, 'submit');
  }

  onCancel() {
    this.modalController.dismiss();
  }

  private initForm() {
    const controls = {
      description: new FormControl(null, [Validators.required])
    };

    this.form = new FormGroup(controls);
  }
}
