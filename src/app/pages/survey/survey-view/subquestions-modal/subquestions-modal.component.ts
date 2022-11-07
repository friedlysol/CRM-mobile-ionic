import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-subquestions-modal',
  templateUrl: './subquestions-modal.component.html',
  styleUrls: ['./subquestions-modal.component.scss'],
})
export class SubquestionsModalComponent implements OnInit {
  subquestions = [];
  submitted = false;

  constructor(
    params: NavParams,
    private modalController: ModalController,
    private toastController: ToastController,
  ) {
    this.subquestions = params.data.subquestions != null ? params.data.subquestions : [];
  }

  ngOnInit() {
  }

  onInputChange(event, subQuestion) {
    subQuestion.answer = event.target.value;
  }

  onCancel() {
    this.modalController.dismiss(null, 'back');
  }

  onSubmit() {
    this.submitted = true;

    for (const subQuestion of this.subquestions) {
      if (subQuestion.required && !subQuestion.answer) {
        return;
      }
    }

    this.modalController.dismiss(this.subquestions, 'submit');
  }


  goBack() {
    this.modalController.dismiss(null, 'back');
  }
}
