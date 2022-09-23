import { Component, Input, OnInit } from '@angular/core';
import { FileInterface } from '@app/interfaces/file.interface';
import { MediaOptionsInterface } from '@app/interfaces/media-options.interface';
import { FileService } from '@app/services/file.service';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-capture-media',
  templateUrl: './capture-media.component.html',
  styleUrls: ['./capture-media.component.scss'],
})
export class CaptureMediaComponent implements OnInit {
  @Input() objectType: string;
  @Input() objectUuid: string;
  @Input() objectId?: number;
  @Input() typeId: number;
  @Input() type: 'photo' | 'video';
  @Input() linkPersonWoId?: number;
  @Input() mediaOptions: MediaOptionsInterface = {
    buttonLabel: 'Media',
    required: false,
    requiredOnce: false,
    minQuantity: 0,
    onlyNewPhoto: true,
    height: null,
    width: null,
    quality: 100,
    greyscale: false,
    requiredDescription: false,
    minLengthDescription: 0,
    allowCropPhoto: false,
    callbackBeforeSave: null,
    class: null,
  };

  quantity = 0;
  description: string;

  constructor(
    private fileService: FileService,
    private alertController: AlertController,
    private toastController: ToastController,
  ) { }

  async ngOnInit() {
    if(this.mediaOptions.required){
      this.quantity = await this.fileService.getTotalByObjectAndType(
        this.objectType,
        this.objectUuid,
        this.typeId,
        this.linkPersonWoId,
      )
    } else if(this.mediaOptions.requiredOnce){
      this.quantity = await this.fileService.getTotalByObjectAndType(
        this.objectType,
        this.objectUuid,
        this.typeId,
      )
    }
  }

  getButtonColor(){
    if(!this.mediaOptions.required && !this.mediaOptions.requiredOnce){
      return 'tertiary';
    }
    
    if((!this.mediaOptions.minQuantity && this.quantity === 0) || 
      (this.mediaOptions.minQuantity > 0 && this.quantity < this.mediaOptions.minQuantity)){
      return 'danger';
    }

    return 'success';
  }

  getButtonLabel(){
    return this.mediaOptions.buttonLabel + 
      (this.mediaOptions.minQuantity > 0? ` ${Math.min(this.quantity, this.mediaOptions.minQuantity)}/${this.mediaOptions.minQuantity}`: '')
  }

  async onClick(){
    if(this.type === 'photo'){
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        saveToGallery: true,
        quality: this.mediaOptions.quality,
        allowEditing: this.mediaOptions.allowCropPhoto,
        source: this.mediaOptions.onlyNewPhoto? CameraSource.Camera: CameraSource.Prompt,
        width: this.mediaOptions.width,
        height: this.mediaOptions.height,
      })
      if(this.mediaOptions.requiredDescription){
        this.description = await this.showDescriptionAlert();
      }
      
      this.savePhoto(photo);
      this.quantity++;
    }else{
      // TODO: getVideo
    }

  }

  async savePhoto(photo: Photo){
    const file: FileInterface = {
      object_type: this.objectType,
      object_uuid: this.objectUuid,
      object_id: this.objectId,
      type_id: this.typeId,
      description: `${this.description || ''}`,
      sync: 0,
      type: this.type,
    }
    let source = photo.dataUrl;

    if(this.mediaOptions.greyscale){
      source = await this.fileService.convertToGrayScale(source);
    }

    try{
      if(this.mediaOptions.callbackBeforeSave){
        const res = await this.mediaOptions.callbackBeforeSave();
        file.description += (res || '');
      }

      const time = new Date().getTime();
      this.fileService.saveBase64File(
        source,
        `${this.type}_${file.object_id}_${file.description}_${time}.png`,
        file,
      )
    }catch(e){}
  }

  async showDescriptionAlert(): Promise<string>{
    const alert = await this.alertController.create({
      header: 'Enter description',
      backdropDismiss: false,
      inputs: [
        {
          name: 'description',
          placeholder: 'Description',
        }
      ],
      buttons: [
        {
          text: 'Submit',
          role: 'submit',
          handler: data => {
            if(data.description.length < this.mediaOptions.minLengthDescription){
              this.showErrorToast(`Description should by at least ${this.mediaOptions.minLengthDescription} characters long.`)
              return false;
            }
          }
        }
      ],
    })
    alert.present();
    return new Promise((resolve) => {   
      alert.onDidDismiss().then((res) => {
        resolve(res.data.values.description);
      })
    })
  }

  async showErrorToast(message: string){
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
    })
    toast.present()
  }

}
