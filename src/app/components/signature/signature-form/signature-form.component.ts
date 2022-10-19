import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

export interface ISignatureFormData {
  ownerName: string;
  ownerTitle: string;
}

@Component({
  selector: 'app-signature-form',
  templateUrl: './signature-form.component.html',
  styleUrls: ['./signature-form.component.scss'],
})
export class SignatureFormComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @Output() next = new EventEmitter<ISignatureFormData>();
  @Input() name = '';
  @Input() title = '';

  ownerName = new FormControl('', [Validators.required]);
  ownerTitle = new FormControl('', [Validators.required]);

  constructor() {
  }

  ngOnInit() {
    this.ownerName.setValue(this.name);
    this.ownerTitle.setValue(this.title);
  }

  onCancel() {
    this.cancel.emit();
  }

  onNext() {
    if (this.ownerName.invalid || this.ownerTitle.invalid) {
      this.ownerName.markAsTouched();
      this.ownerTitle.markAsTouched();
      return;
    }

    this.next.emit({
      ownerName: this.ownerName.value,
      ownerTitle: this.ownerTitle.value,
    });
  }

}
