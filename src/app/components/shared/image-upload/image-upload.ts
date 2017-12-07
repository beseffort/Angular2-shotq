import { Directive, ElementRef, OnInit, Input, Output, EventEmitter, Renderer, OnChanges, SimpleChange } from '@angular/core';

import { ImageResult, ResizeOptions } from './interfaces';
import { createImage, resizeImage } from './utils';

@Directive({
    selector: 'input[type=file][image-upload]'
})
export class ImageUpload implements OnInit {

    @Output() imageSelected = new EventEmitter<ImageResult>();

    @Input() file: any = undefined;

    @Input() resizeOptions: ResizeOptions;

    constructor(private _elementref: ElementRef, private _renderer: Renderer) {
    }

    ngOnInit() {
        this._renderer.listen(this._elementref.nativeElement, 'change', e => this.readFiles(e));
    }

    ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
      for (let propName in changes) {
        if (changes.hasOwnProperty(propName)) {
          let chng = changes[propName];
          let cur  = JSON.stringify(chng.currentValue);
          let prev = JSON.stringify(chng.previousValue);
          if (propName === 'file' && chng.currentValue !== undefined) {
              this.addFile();
          }
        }
      }
    }

    private addFile() {
        let result: ImageResult = {
            file: this.file,
            url: URL.createObjectURL(this.file)
        };
        this.fileToDataURL(this.file, result).then(r => this.resize(r)).then(r => this.imageSelected.emit(r));
    }

    private readFiles(event) {
        for (let file of event.target.files) {
            let result: ImageResult = {
                file: file,
                url: URL.createObjectURL(file)
            };
            this.fileToDataURL(file, result).then(r => this.resize(r)).then(r => this.imageSelected.emit(r));
        }
    }

    private resize(result: ImageResult): Promise<ImageResult> {
        return new Promise((resolve) => {
            if (this.resizeOptions) {
                createImage(result.url, image => {
                    let dataUrl = resizeImage(image, this.resizeOptions);
                    result.resized = {
                        dataURL: dataUrl,
                        type: dataUrl.match(/:(.+\/.+;)/)[1],
                        width: image.width,
                        height: image.height
                    };
                    resolve(result);
                });
            } else {
                resolve(result);
            }
        });
    }

    private fileToDataURL(file: File, result: ImageResult): Promise<ImageResult> {
        return new Promise((resolve) => {
            let reader = new FileReader();
            reader.onload = function(e) {
                result.dataURL = reader.result;
                resolve(result);
            };
            reader.readAsDataURL(file);
        });
    }
}
