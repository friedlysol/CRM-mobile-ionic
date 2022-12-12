import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FileInterface } from '@app/interfaces/file.interface';
import { FileService } from '@app/services/file.service';
import { IonModal} from '@ionic/angular';
import { ISignatureFormData } from './signature-form/signature-form.component';

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
  @Output() saveFile = new EventEmitter<FileInterface>();

  file: FileInterface;
  ownerName = '';
  ownerTitle = '';
  image: string;

  constructor(
    private fileService: FileService,
  ) { }

  async ngOnInit() {
    await this.readSignature();
    if(this.file){
      [this.ownerName, this.ownerTitle] = this.file.description.split('_');
    }
  }

  onGetSignatureClick(){
    this.formModal.present();
  }

  onFormCancel(){
    this.formModal.dismiss(null, 'cancel');
  }

  onFormNext(data: ISignatureFormData){
    this.ownerName = data.ownerName;
    this.ownerTitle = data.ownerTitle;
    this.canvasModal.present();
  }

  onCanvasCancel(){
    this.canvasModal.dismiss(null, 'cancel');
  }

  onSave(image: string){
    this.image = image;

    this.onCanvasCancel();
    this.onFormCancel();
    this.saveSignature();
  }

  async readSignature(){
    return this.fileService.getLastByObjectAndType(
      this.objectType,
      this.objectUuid,
      this.typeId,
    ).then((file) => {
      this.file = file;
    });
  }

  async saveSignature(){
    let description = this.ownerName;
    if(this.ownerTitle) {
      description += '_' + this.ownerTitle;
    }

    this.file = {
      object_type: this.objectType,
      object_uuid: this.objectUuid,
      object_id: this.objectId,
      type_id: this.typeId,
      description,
      sync: 0,
      path: '',
      type: 'signature',
    };

    const time = new Date().getTime();

    await this.fileService.saveBase64File(
      this.image,
      `signature_${this.file.object_id}_${this.file.description}_${time}.png`,
      this.file,
    );

    this.saveFile.next(this.file);
  }
}
