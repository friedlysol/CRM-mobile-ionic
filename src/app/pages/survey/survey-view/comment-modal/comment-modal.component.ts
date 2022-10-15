import { Component } from '@angular/core';
import { ModalController, NavParams, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-comment-modal',
  templateUrl: './comment-modal.component.html',
  styleUrls: ['./comment-modal.component.scss'],
})
export class CommentModalComponent {
  comment = '';

  constructor(
    private modalCtrl: ModalController,
    params: NavParams,
    private toastController: ToastController,
  ) {
    this.comment = params.data.comment || this.comment;
  }

  onSubmit(){
    if(this.comment.length < 1){
      this.showErrorToast('You must provide a comment');
      return;
    }
    this.modalCtrl.dismiss(this.comment, 'submit');
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
    });

    toast.present();
  }
}
