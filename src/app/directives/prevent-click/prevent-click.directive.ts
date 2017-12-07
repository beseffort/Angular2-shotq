import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[stop-click]'
})
export class StopClick {
  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
}
