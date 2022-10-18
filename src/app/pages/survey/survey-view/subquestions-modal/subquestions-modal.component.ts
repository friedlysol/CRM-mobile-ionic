import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-subquestions-modal',
  templateUrl: './subquestions-modal.component.html',
  styleUrls: ['./subquestions-modal.component.scss'],
})
export class SubquestionsModalComponent implements OnInit {
  subquestions = [];

  constructor(
    params: NavParams,
    private modalCtrl: ModalController,
    private toastController: ToastController,
  ) {
    this.subquestions= params.data.subquestions != null? params.data.subquestions: [];
  }

  ngOnInit() {}

  onInputChange(event, subquestion){
    subquestion.answer = event.target.value;
  }

  onSubmit(){
    for(const subquestion of this.subquestions){
      if(subquestion.required && (!subquestion.answer || subquestion.answer.length < 1)){
        this.showErrorToast('You must provide all required fields.');
        return;
      }
    }
    this.modalCtrl.dismiss(this.subquestions, 'submit');
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
    });

    toast.present();
  }

  goBack(){
    this.modalCtrl.dismiss(null, 'back');
  }
}
