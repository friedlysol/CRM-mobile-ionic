import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appSelectOnClick]'
})
export class SelectOnClickDirective {

  constructor(private el: ElementRef) {
  }

  @HostListener('click')
  select() {
    const nativeEl: HTMLInputElement = this.el.nativeElement.querySelector('input');

    if (nativeEl) {
      nativeEl.select();
    }
  }
}
