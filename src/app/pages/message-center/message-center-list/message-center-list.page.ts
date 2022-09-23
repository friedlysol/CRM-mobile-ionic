import { Component, OnInit } from '@angular/core';
import { MediaOptionsInterface } from '@app/interfaces/media-options.interface';

@Component({
  selector: 'app-message-center-list',
  templateUrl: './message-center-list.page.html',
  styleUrls: ['./message-center-list.page.scss'],
})
export class MessageCenterListPage implements OnInit {
  buttonLabel: MediaOptionsInterface = {
    buttonLabel: 'Add photos',
    onlyNewPhoto: true,
    requiredOnce: true,
    greyscale: true,
    callbackBeforeSave: () => new Promise((resolve, reject) => {
      resolve('t')
    })
  }
  constructor() { }

  ngOnInit() {
  }
}
