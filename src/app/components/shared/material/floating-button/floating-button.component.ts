import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'mfb-button',
  providers: [NgModel],
  styleUrls: ['floating-button.component.scss'],
  templateUrl: 'floating-button.component.html'
})
export class FBComponent {
}

