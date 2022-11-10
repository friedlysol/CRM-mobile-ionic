import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessagesService } from '@app/services/messages.service';
import { ModalController, NavParams } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '@app/services/database.service';
import { MessageInterface } from '@app/interfaces/message.interface';
import { MessagesDatabase } from '@app/services/database/messages.database';
import { TypeService } from '@app/services/type.service';
import { PersonDatabase } from '@app/services/database/person.database';
import { PersonInterface } from '@app/interfaces/person.interface';

@Component({
  selector: 'app-message-center-form',
  templateUrl: './message-center-form.page.html',
  styleUrls: ['./message-center-form.page.scss'],
})
export class MessageCenterFormPage implements OnInit {
  public objectType: string;
  public objectUuid: string;
  public objectId: number;

  public isNote: boolean;

  public uuid: string;
  public form: FormGroup;
  public type: string;

  public persons: PersonInterface[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private databaseService: DatabaseService,
    private messagesDatabase: MessagesDatabase,
    private messagesService: MessagesService,
    private modalController: ModalController,
    private navParams: NavParams,
    private personDatabase: PersonDatabase,
  ) {
    this.isNote = navParams.data.isNote || !!this.objectType;
  }

  async ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(async params => {
      this.objectType = params.get('objectType');
      this.objectUuid = params.get('objectUuid');
      this.objectId = Number(params.get('objectId'));

      this.type = this.objectType
        ? 'activity'
        : 'calendar_event';
    });

    this.uuid = this.databaseService.getUuid();

    if (!this.isNote) {
      this.persons = await this.personDatabase.getAll();
      this.persons = this.persons.map(person => {
        person.label = person.first_name + ' ' + person.last_name

        return person;
      });
    }


    console.log(this.persons);

    this.initForm();
  }

  get description() {
    return this.form.get('description');
  }

  get hot() {
    return this.form.get('hot');
  }

  get personId() {
    return this.form.get('person_id');
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const messageData = {
      uuid: this.uuid,
      type: this.type,
      object_type: this.objectType,
      object_uuid: this.objectUuid,
      object_id: this.objectId,
      description: this.description.getRawValue()
    } as MessageInterface;

    if(!this.isNote) {
      messageData['person_id'] = this.personId.getRawValue();
      messageData['hot'] = this.hot.getRawValue();
    }

    const message = await this.messagesDatabase.create(messageData);

    await this.modalController.dismiss(message, 'submit');
  }

  onCancel() {
    this.modalController.dismiss();
  }

  private initForm() {
    const controls = {
      description: new FormControl(null, [Validators.required])
    };

    if(!this.isNote) {
      controls['person_id'] = new FormControl(this.navParams.data.person_id || 0);
      controls['hot'] = new FormControl(0);
    }

    console.log('controls', controls);

    this.form = new FormGroup(controls);
  }
}
