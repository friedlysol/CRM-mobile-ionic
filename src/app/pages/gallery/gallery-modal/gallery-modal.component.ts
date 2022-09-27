import { Component, OnInit } from '@angular/core';
import { FileInterface } from '@app/interfaces/file.interface';
import { PrevNextInterface } from '@app/interfaces/prev-next.interface';
import { FileService } from '@app/services/file.service';
import { Capacitor } from '@capacitor/core';
import { ModalController, NavParams } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-gallery-modal',
  templateUrl: './gallery-modal.component.html',
  styleUrls: ['./gallery-modal.component.scss'],
})
export class GalleryModalComponent implements OnInit {
  file: FileInterface;
  index: number;
  filesLength: number;
  prevNext: PrevNextInterface;

  constructor(
    private fileService: FileService,
    private modalCtrl: ModalController,
    private params: NavParams,
  ) {
    this.file = params.data.currentFile;
    this.index = params.data.index;
    this.filesLength = params.data.filesLength;
  }

  ngOnInit() {
    this.fileService.getPrevAndNextByUuid(this.file.uuid).then((res) => {
      this.prevNext = res;
    });
  }

  getFilePath(){
    const source = this.file.thumbnail? this.file.thumbnail: this.file.path;
    return Capacitor.convertFileSrc(source);
  }

  getLocalDate(date: string){
    return moment.utc(date).local().format('YYYY-MM-DD HH:mm:ss');
  }

  async loadPrev(){
    if(!this.prevNext.prev){
      return;
    }
    this.file = await this.fileService.getByUuid(this.prevNext.prev);
    this.prevNext = await this.fileService.getPrevAndNextByUuid(this.file.uuid);
    this.index++;
  }

  async loadNext(){
    if(!this.prevNext.next){
      return;
    }
    this.file = await this.fileService.getByUuid(this.prevNext.next);
    this.prevNext = await this.fileService.getPrevAndNextByUuid(this.file.uuid);
    this.index--;
  }

  onCloseClick(){
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
