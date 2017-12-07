import { ElementRef, HostListener, Directive } from '@angular/core';

@Directive({
  selector: 'input[autosize]'
})

export class AutosizeDirective {
  base: number;

  constructor(public element: ElementRef) { }

  @HostListener('input', ['$event.target'])
  onInput(textArea: HTMLInputElement): void {
    this.adjust();
  }

  ngAfterContentChecked(): void {
    this.adjust();
  }

  adjust(): void {
    if (!this.base) {
      this.base = parseInt(this.element.nativeElement.offsetWidth, 10);
    }
    this.element.nativeElement.style.overflow = 'hidden';
    // this.element.nativeElement.style.height = 'auto';
    if (this.element.nativeElement.scrollWidth > this.base) {
      this.element.nativeElement.style.width = this.element.nativeElement.scrollWidth + 'px';
    } else {
      this.element.nativeElement.style.width = this.base + 'px';
    }
  }
}
