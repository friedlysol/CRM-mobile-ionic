import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FileInterface } from '@app/interfaces/file.interface';
import { FileService } from '@app/services/file.service';
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
  @Input() typeId: number;
  @Input() objectId?: number;
  @Input() label?: string;

  file: FileInterface;
  ownerName = '';
  ownerTitle = '';
  image: string;

  constructor(
    private fileService: FileService,
  ) { }

  ngOnInit(): void {
    this.readSignature();
  }

  onGetSignatureClick(){
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
    console.log({image: this.image})
    this.onCanvasCancel()
    this.onFormCancel();
    this.saveSignature();
  }

  readSignature(){
    this.fileService.getLastByObjectAndType(
      this.objectType,
      this.objectUuid,
      this.typeId,
    ).then((file) => {
      this.file = file;
    })
  }

  saveSignature(){
    this.file = {
      object_type: this.objectType,
      object_uuid: this.objectUuid,
      object_id: this.objectId,
      type_id: this.typeId,
      description: `${this.ownerName}_${this.ownerTitle}`,
      sync: 0,
      path: '',
      type: 'signature',
    }

    const time = new Date().getTime();

    this.fileService.saveBase64File(
      this.image,
      `signature_${this.file.object_id}_${this.file.description}_${time}.png`,
      this.file,
    )
  }
}
