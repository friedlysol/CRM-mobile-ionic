import { Component, OnInit } from '@angular/core';
import { FileInterface } from '@app/interfaces/file.interface';
import { DatabaseService } from '@app/services/database.service';
import { FileService } from '@app/services/file.service';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { environment } from '@env/environment';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { GalleryModalComponent } from '../gallery-modal/gallery-modal.component';
import { TypeService } from '@app/services/type.service';
import { TypeInterface } from '@app/interfaces/type.interface';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-gallery-list',
  templateUrl: './gallery-list.page.html',
  styleUrls: ['./gallery-list.page.scss'],
})
export class GalleryListPage implements OnInit {
  objectType: string;
  objectUuid: string;
  objectId: number;
  readOnly = false;

  typeId: number;

  page = 1;
  files: FileInterface[];
  types: TypeInterface[];

  constructor(
    private alertController: AlertController,
    private databaseService: DatabaseService,
    private fileService: FileService,
    private modalController: ModalController,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private typeService: TypeService
  ) {

  }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.objectType = params.get('objectType');
      this.objectUuid = params.get('objectUuid');
    });

    this.route.queryParamMap.subscribe(async params => {
      this.objectId = params.get('objectId') ? Number(params.get('objectId')) : null;
      this.readOnly = params.get('readOnly') === '1';
    });

    // Get data
    this.loadFiles()
      .then((res) => {
        this.files = res;
      });

    this.types = await this.typeService.getByType(this.objectType);
  }

  async loadFiles(): Promise<FileInterface[]> {
    return await this.fileService.getArrayByObjectAndType(
      this.objectType,
      this.objectUuid,
      this.page,
      environment.pageSize
    );
  }

  async nextPage(event) {
    this.page++;
    const newFiles = await this.loadFiles();
    this.files = [...this.files, ...newFiles];

    event.target.complete();

    if (newFiles.length < environment.pageSize) {
      event.target.disabled = true;
    }
  }

  async onDeleteClick(file: FileInterface) {
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
        file.sync = 1;
        this.fileService.removeFile(file).then((res) => {
          this.files = this.files.filter(el => el.uuid !== file.uuid);
        });
      }
    });
  }

  async onAddClick() {
    const alert = await this.alertController.create({
      header: 'Select type',
      inputs: this.types.map((type, i) => ({
          type: 'radio',
          label: type.type_value,
          value: type.id,
          checked: i === 0,
        })
      ),
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
        this.capturePhoto(data.data.values);
      }
    });
  }

  async capturePhoto(typeId: number) {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      saveToGallery: true,
      source: CameraSource.Camera,
    });

    return this.savePhoto(photo, typeId);
  }

  async savePhoto(photo: Photo, typeId: number) {
    const typeLabel = this.types.find(type => type.id === typeId).type_value;

    const file: FileInterface = {
      uuid: this.databaseService.getUuid(),
      object_type: this.objectType,
      object_uuid: this.objectUuid,
      object_id: this.objectId,
      type_id: typeId,
      sync: 0,
      type: typeLabel,
      description: await this.showDescriptionAlert(),
    };

    const source = photo.dataUrl;
    const thumbnailBase64 = await this.fileService.generateThumbnail(source);

    file.thumbnail = await this.fileService.createFileAndGetUrl(thumbnailBase64, `${file.uuid}_thumbnail.jpg`);

    try {
      const time = new Date().getTime();
      this.fileService.saveBase64File(
        source,
        `${typeLabel}_${file.object_id}_${file.description}_${time}.png`,
        file,
      ).then(() => {
        this.files.unshift(file);
      });
    } catch (e) {
    }
  }

  async showDescriptionAlert(): Promise<string> {
    const minLengthDescription = 5;
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
            if (data.description.length < minLengthDescription) {
              this.showErrorToast(`Description should by at least ${minLengthDescription} characters long.`);
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

  async openGalleryModal(file: FileInterface, index: number) {
    const modal = await this.modalController.create({
      component: GalleryModalComponent,
      componentProps: {
        currentFile: file,
        index: index + 1,
        filesLength: await this.fileService.getTotalByObjectAndType(this.objectType, this.objectUuid),
      },
    });

    return modal.present();
  }

  getFilePath(file: FileInterface) {
    const source = file.thumbnail ? file.thumbnail : file.path;

    return Capacitor.convertFileSrc(source);
  }

  trackByItem(index: number, item: FileInterface) {
    return item.uuid;
  }
}
