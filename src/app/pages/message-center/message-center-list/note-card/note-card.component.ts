import { Component, Input, OnInit } from '@angular/core';
import { MessageInterface } from '@app/interfaces/message.interface';
import { UtilsService } from '@app/services/utils.service';

@Component({
  selector: 'app-note-card',
  templateUrl: './note-card.component.html',
  styleUrls: ['./note-card.component.scss'],
})
export class NoteCardComponent implements OnInit {
  @Input() message: MessageInterface;

  constructor(
    public utilsService: UtilsService,
  ) { }

  ngOnInit() {}

}
