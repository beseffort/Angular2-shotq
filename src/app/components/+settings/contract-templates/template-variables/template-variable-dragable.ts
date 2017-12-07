import { ElementRef, Input, Directive } from '@angular/core';
import { TinymceComponent } from '../../../shared/tinymce-editor/tinymce-editor.component';
@Directive({
  selector: '[makeDraggable]'
})
export class MakeDraggable {
  @Input('makeDraggable') data: any;

  constructor(private _elementRef: ElementRef) {
  }

  ngOnInit() {
    let self = this;
    let el = this._elementRef.nativeElement;

    el.draggable = 'true';

    el.addEventListener('dragstart', (e) => {
      let d = JSON.stringify(this.data);
      e.dataTransfer.setData('text/html', TinymceComponent.renderVariable(self.data));
    });

  }
}
