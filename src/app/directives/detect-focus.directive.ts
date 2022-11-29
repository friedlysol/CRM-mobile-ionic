import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appDetectFocus]',
  exportAs: 'detectFocus'
})
export class DetectFocusDirective {
  private _isFocus = false;

  get isFocus() {
    console.log('focus', this._isFocus);
    return this._isFocus;
  }
  constructor() { }

  @HostListener('focus', ["$event"])
  onFocus() {
    console.log('set focus');

    this._isFocus = true;
  }

  @HostListener('blur', ["$event"])
  onBlur() {
    console.log('set blur');

    this._isFocus = false;
  }
}
