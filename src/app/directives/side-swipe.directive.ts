import {AfterViewInit, Directive, EventEmitter, Output} from '@angular/core';
import * as Hammer from 'hammerjs';

@Directive({
    selector: '[appSideSwipe]'
})
export class SideSwipeDirective implements AfterViewInit {
    @Output() swipeLeft: EventEmitter<any>;
    @Output() swipeRight: EventEmitter<any>;

    constructor() {
        this.swipeRight = new EventEmitter<any>();
        this.swipeLeft = new EventEmitter<any>();
    }

    ngAfterViewInit() {
        const mc = new Hammer(document.querySelector('body'));

        mc.on('swipeLeft', (ev) => {
            console.log('swipeLeft', ev);

            this.swipeLeft.emit();
        });

        mc.on('swipeRight', (ev) => {
            console.log('swipeRight', ev);

            this.swipeRight.emit();
        });
    }
}
