import { Component, Input, OnInit } from '@angular/core';
import { FileInterface } from '@app/interfaces/file.interface';
import { MediaOptionsInterface } from '@app/interfaces/media-options.interface';
import { DatabaseService } from '@app/services/database.service';
import { FileService } from '@app/services/file.service';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
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

  @Input()
  get mediaOptions(): MediaOptionsInterface {
    return this._mediaOptions;
  };

  set mediaOptions(options: MediaOptionsInterface) {
    this._mediaOptions = {
      buttonLabel: options.buttonLabel != null ? options.buttonLabel : 'Media',
      required: options.required != null ? options.required : false,
      requiredOnce: options.requiredOnce != null ? options.requiredOnce : false,
      minQuantity: options.minQuantity != null ? options.minQuantity : 0,
      onlyNewPhoto: options.onlyNewPhoto != null ? options.onlyNewPhoto : true,
      height: options.height != null ? options.height : null,
      width: options.width != null ? options.width : null,
      quality: options.quality != null ? options.quality : 100,
      greyscale: options.greyscale != null ? options.greyscale : false,
      requiredDescription: options.requiredDescription != null ? options.requiredDescription : false,
      minLengthDescription: options.minLengthDescription != null ? options.minLengthDescription : 0,
      allowCropPhoto: options.allowCropPhoto != null ? options.allowCropPhoto : false,
      allowRemove: options.allowRemove != null ? options.allowRemove : false,
      callbackBeforeSave: options.callbackBeforeSave != null ? options.callbackBeforeSave : null,
      thumbnail: options.thumbnail != null ? options.thumbnail : true,
      class: options.class != null ? options.class : null,
    };
  };

  public _mediaOptions: MediaOptionsInterface;
  public photo: FileInterface;

  private quantity = 0;
  private description: string;


  constructor(
    private alertController: AlertController,
    private databaseService: DatabaseService,
    private fileService: FileService,
    private toastController: ToastController,
  ) {
  }

  async ngOnInit() {
    if (this.mediaOptions.required || this.mediaOptions.requiredOnce) {
      this.quantity = await this.fileService.getTotalByObjectAndType(
        this.objectType,
        this.objectUuid,
        this.typeId,
        this.mediaOptions.requiredOnce ? this.linkPersonWoId : null
      );
    }

    if(this.mediaOptions.allowRemove) {
      this.photo = await this.fileService.getLastByObjectAndType(
        this.objectType,
        this.objectUuid,
        this.typeId,
        this.mediaOptions.requiredOnce ? this.linkPersonWoId : null
      );
    }
  }

  getButtonColor() {
    if (!this.mediaOptions.required && !this.mediaOptions.requiredOnce) {
      return 'tertiary';
    }

    if ((!this.mediaOptions.minQuantity && this.quantity === 0) ||
      (this.mediaOptions.minQuantity > 0 && this.quantity < this.mediaOptions.minQuantity)) {
      return 'danger';
    }

    return 'success';
  }

  getButtonLabel() {
    return this.mediaOptions.buttonLabel +
      (this.mediaOptions.minQuantity > 0 ?
        ` ${Math.min(this.quantity, this.mediaOptions.minQuantity)}/${this.mediaOptions.minQuantity}` :
        '');
  }

  async onClick() {
    if (this.type === 'photo') {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        saveToGallery: true,
        quality: this.mediaOptions.quality,
        allowEditing: this.mediaOptions.allowCropPhoto,
        source: this.mediaOptions.onlyNewPhoto ? CameraSource.Camera : CameraSource.Prompt,
        width: this.mediaOptions.width,
        height: this.mediaOptions.height,
      });
      if (this.mediaOptions.requiredDescription) {
        this.description = await this.showDescriptionAlert();
      }

      this.savePhoto(photo);
      this.quantity++;
    } else {
      // TODO: getVideo
    }

  }

  async savePhoto(photo: Photo) {
    const file: FileInterface = {
      uuid: this.databaseService.getUuid(),
      object_type: this.objectType,
      object_uuid: this.objectUuid,
      object_id: this.objectId,
      type_id: this.typeId,
      description: `${this.description || ''}`,
      sync: 0,
      type: this.type,
    };

    let source = photo.dataUrl;

    if (this.mediaOptions.greyscale) {
      source = await this.fileService.convertToGrayScale(source);
    }

    if (this.mediaOptions.thumbnail) {
      const thumbnailBase64 = await this.fileService.generateThumbnail(source);

      file.thumbnail = await this.fileService.createFileAndGetUrl(thumbnailBase64, `${file.uuid}_thumbnail.jpg`);
    }

    try {
      if (this.mediaOptions.callbackBeforeSave) {
        const res = await this.mediaOptions.callbackBeforeSave();
        file.description += (res || '');
      }

      const time = new Date().getTime();
      await this.fileService.saveBase64File(
        source,
        `${this.type}_${file.object_id}_${file.description}_${time}.jpg`,
        file,
      );
      this.photo = file;
    } catch (e) {
    }
  }

  async showDescriptionAlert(): Promise<string> {
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
            if (data.description.length < this.mediaOptions.minLengthDescription) {
              this.showErrorToast(`Description should by at least ${this.mediaOptions.minLengthDescription} characters long.`);
              return false;
            }
          }
        }
      ],
    });

    alert.present();

    return new Promise((resolve) => {
      alert.onDidDismiss().then((res) => {
        resolve(res.data.values.description);
      });
    });
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
    });

    toast.present();
  }

  async onRemoveClick() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to delete this file?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Submit',
          role: 'submit',
        },
      ]
    });

    alert.present();
    alert.onDidDismiss().then((data) => {
      if (data.role === 'submit') {
        this.fileService.removeFile(this.photo).then((res) => {
          if (!res) {
            return;
          }
          this.photo = null;
          this.quantity--;
        });
      }
    });
  }

  getFilePath() {
    const source = this.photo.thumbnail ? this.photo.thumbnail : this.photo.path;
    return Capacitor.convertFileSrc(source);
  }
}
