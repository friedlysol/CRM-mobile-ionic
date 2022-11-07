import { Component } from '@angular/core';
import { ModalController, NavParams, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-comment-modal',
  templateUrl: './comment-modal.component.html',
  styleUrls: ['./comment-modal.component.scss'],
})
export class CommentModalComponent {
  comment = '';
  submitted = false;

  constructor(params: NavParams, private modalController: ModalController) {
    this.comment = params.data.comment != null ? params.data.comment : '';
  }

  onCancel() {
    this.modalController.dismiss();
  }

  onSubmit() {
    this.submitted = true;

    if (!this.comment) {
      return;
    }

    this.modalController.dismiss(this.comment, 'submit');
  }
}
