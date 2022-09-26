import { Component, OnInit } from '@angular/core';
import { FileInterface } from '@app/interfaces/file.interface';
import { Capacitor } from '@capacitor/core';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-gallery-modal',
  templateUrl: './gallery-modal.component.html',
  styleUrls: ['./gallery-modal.component.scss'],
})
export class GalleryModalComponent implements OnInit {
  file: FileInterface;
  index: number;
  filesLength: number;

  constructor(params: NavParams) {
    this.file = params.data.currentFile;
    this.index = params.data.index;
    this.filesLength = params.data.filesLength;
  }

  ngOnInit() {}

  getFilePath(){
    const source = this.file.thumbnail? this.file.thumbnail: this.file.path;
    return Capacitor.convertFileSrc(source);
  }

  loadPrev(){
    if(this.index === 1){
      return;
    }
    console.log('prev');
    this.index--;
  }

  loadNext(){
    if(this.index === this.filesLength){
      return;
    }
    console.log('next');
    this.index++;
  }
}
