import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonModal} from '@ionic/angular';
import { ISignatureFromData } from './signature-form/signature-form.component';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss'],
})
export class SignatureComponent implements OnInit {
  @ViewChild('formModal') formModal: IonModal;
  @ViewChild('canvasModal') canvasModal: IonModal;
  @Input() objectType: string;
  @Input() objectUuid: string;
  @Input() objectId?: number;
  @Input() typeId: number;
  @Input() label?: string;

  ownerName = '';
  ownerTitle = '';
  image: string;

  constructor() { }

  ngOnInit(): void {}

  onClick(){
    this.formModal.present();
  }

  onFormCancel(){
    this.formModal.dismiss(null, 'cancel');
  }

  onFormNext(data: ISignatureFromData){
    this.ownerName = data.ownerName;
    this.ownerTitle = data.ownerTitle;
    this.canvasModal.present();
  }

  onCanvasCancel(){
    this.canvasModal.dismiss(null, 'cancel');
  }

  onSave(image: string){
    this.image = image;
    console.log({
      ownerName: this.ownerName,
      ownerTitle: this.ownerTitle,
      image: this.image,
    })
    this.onCanvasCancel()
    this.onFormCancel();
  }

  readSignature(){

  }

  saveSignature(){

  }
}
