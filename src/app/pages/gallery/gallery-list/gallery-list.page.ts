import { Component, OnInit } from '@angular/core';
import { FileInterface } from '@app/interfaces/file.interface';
import { FileService } from '@app/services/file.service';
import { Capacitor } from '@capacitor/core';
import { environment } from '@env/environment';
import { ModalController } from '@ionic/angular';
import { GalleryModalComponent } from '../gallery-modal/gallery-modal.component';

@Component({
  selector: 'app-gallery-list',
  templateUrl: './gallery-list.page.html',
  styleUrls: ['./gallery-list.page.scss'],
})
export class GalleryListPage implements OnInit {
  objectType = '0';
  objectUuid = '0';
  photoType = 'asset_pictures';
  readOnly = false;
  page = 1;
  files: FileInterface[];
  currentFiles: FileInterface[];

  constructor(
    private fileService: FileService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    // Get data
    this.fileService.getAllByObjectAndType(
      this.objectType,
      this.objectUuid,
      0,
    ).then((res) => {
      console.log(res);
      this.files = res.reverse();
      this.updateCurrentFiles();
    });
  }

  nextPage(event){
    this.page++;
    this.updateCurrentFiles();
    event.target.complete();
    if(this.currentFiles.length === this.files.length){
      event.target.disabled = true;
    }
  }

  onDeleteClick(file: FileInterface){
    this.fileService.deleteFile(file).then((res) => {
      console.log(res);
    });
  }

  onAddClick(){
    // TODO: Add new
  }

  async openGalleryModal(file: FileInterface, index: number){
    const modal = await this.modalController.create({
      component: GalleryModalComponent,
      componentProps: {
        currentFile: file,
        index: index+1,
        filesLength: this.files.length,
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

  private updateCurrentFiles(){
    this.currentFiles = this.files.slice(0, this.page*environment.pageSize);
  }
}
