import { Component, OnInit } from '@angular/core';
import { FileInterface } from '@app/interfaces/file.interface';
import { DatabaseService } from '@app/services/database.service';
import { FileService } from '@app/services/file.service';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { environment } from '@env/environment';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { GalleryModalComponent } from '../gallery-modal/gallery-modal.component';
import { CaptureMediaComponent } from '@app/components/capture-media/capture-media.component';

// TODO: Call to service
const types = [
  {
    id: 0,
    label: '1',
  },
  {
    id: 1,
    label: '2',
  },
  {
    id: 2,
    label: '3',
  },
];

@Component({
  selector: 'app-gallery-list',
  templateUrl: './gallery-list.page.html',
  styleUrls: ['./gallery-list.page.scss'],
})
export class GalleryListPage implements OnInit {
  objectType = '0';
  objectUuid = '0';
  objectId = 0;
  typeId = 0;
  photoType = 'asset_pictures';
  readOnly = false;

  page = 1;
  files: FileInterface[];

  constructor(
    private alertController: AlertController,
    private databaseService: DatabaseService,
    private fileService: FileService,
    private modalController: ModalController,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    this.loadFiles().then((res) => {
      console.log(res);
      this.files = res;
    });
  }

  async loadFiles(): Promise<FileInterface[]>{
    return await this.fileService.getArrayByObjectAndType(
      this.objectType,
      this.objectUuid,
      this.typeId,
      this.page,
      environment.pageSize
    );
  }

  async nextPage(event){
    this.page++;
    const newFiles = await this.loadFiles();
    this.files = [...this.files, ...newFiles];
    event.target.complete();
    if(newFiles.length < environment.pageSize){
      event.target.disabled = true;
    }
  }

  async onDeleteClick(file: FileInterface){
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
      if(data.role === 'submit'){
        file.sync = 1;
        this.fileService.removeFile(file).then((res) =>  {
          this.files = this.files.filter(el => el.uuid !== file.uuid);
        });
      }
    });
  }

  async onAddClick(){
    const alert = await this.alertController.create({
      header: 'Select type',
      inputs: types.map((type, i) => ({
          type: 'radio',
          label: type.label,
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
      if(data.role === 'submit'){
        this.capturePhoto(data.data.values);
      }
    });
  }

  async capturePhoto(typeId: number){
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      saveToGallery: true,
      source: CameraSource.Camera,
    });
    this.savePhoto(photo, typeId);
  }

  async savePhoto(photo: Photo, typeId: number){
    const typeLabel = types.find(type => type.id === typeId).label;
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

    const thumbnailBase64 = await this.fileService.generateThumnail(source);
    file.thumbnail = await this.fileService.createFileAndGetUrl(
      thumbnailBase64,
      `${file.uuid}_thumbnail.jpg`
    );

    try{
      const time = new Date().getTime();
      this.fileService.saveBase64File(
        source,
        `${typeLabel}_${file.object_id}_${file.description}_${time}.png`,
        file,
      ).then(() => {
        this.files.unshift(file);
      });
    }catch(e){}
  }

  async showDescriptionAlert(): Promise<string>{
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
            if(data.description.length < minLengthDescription){
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

  async showErrorToast(message: string){
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
    });
    toast.present();
  }

  async openGalleryModal(file: FileInterface, index: number){
    const modal = await this.modalController.create({
      component: GalleryModalComponent,
      componentProps: {
        currentFile: file,
        index: index+1,
        filesLength: await this.fileService.getTotalByObjectAndType(this.objectType, this.objectUuid, this.typeId),
      },
    });
    modal.present();
  }

  getFilePath(file: FileInterface){
    const source = file.thumbnail? file.thumbnail: file.path;
    return Capacitor.convertFileSrc(source);
  }

  trackByItem(index: number, item: FileInterface){
    return item.uuid;
  }

  getPhotosToDownload(){
    if(!this.files) {
      return [];
    }
    return this.files.filter(file => /^https?:\/\//.test(file.path) && !file.is_downloaded);
  }

  onDownloadPhotosClick(){
    // TODO: Download files
    this.getPhotosToDownload().forEach(f => f.is_downloaded = true);
  }
}
