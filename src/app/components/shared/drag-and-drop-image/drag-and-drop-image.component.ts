import { Component, Input, EventEmitter, Output, ViewChild, HostListener } from '@angular/core';
import { ImageResult, ResizeOptions } from '../image-upload/interfaces';
import { FileUploader } from 'ng2-file-upload';
import { FileItem } from 'ng2-file-upload/components/file-upload/file-item.class';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'drag-and-drop-image',
  templateUrl: './drag-and-drop-image.component.html',
  styleUrls : ['./drag-and-drop-image.component.scss']
})
export class DragAndDropImageComponent {

  @Input() dropZoneCssClass: string;
  @Input() dropZoneOverCssClass: string;
  @Input() showImage: boolean = false;
  @Output() imgSelected = new EventEmitter<Object>();
  @Output() associateImg = new EventEmitter<Object>();
  @ViewChild('imgInput') imgInput: any;

  public uploader: FileUploader = new FileUploader({
    url: this.apiService.apiUrl + '/storage/upload/' + this.apiService.auth.id + '/',
    authToken: this.apiService.getOauthAutorization()
  });
  public hasBaseDropZoneOver: boolean = false;
  public resizeOptions: ResizeOptions = {
    resizeMaxHeight: 400,
    resizeMaxWidth: 400
  };
  private filesLenght = 0;
  private fileDraged: any = undefined;
  private image: any = {
    name: undefined,
    size: undefined,
    w: undefined,
    h: undefined,
    url: undefined
  };

  constructor(private apiService: ApiService) {
    this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {
      let str_json_response = JSON.parse(response);
      let json = JSON.parse(str_json_response);
      this.associateImg.emit({file_id: json.file_id, url: json.url});
    };
  }

  ngDoCheck() {}

  /**
   * [detect when a file is over the drop zone]
   * @param {any} e [event object]
   */
  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }
  /**
   * [Open the dialog box to select a image file]
   * @param {any} e [event object]
   */
  private openDialogBox(e: any) {
    if (this.imgInput) {
      let fileInput2 = <HTMLInputElement>document.getElementById('img-input');
      if (fileInput2) {
        fileInput2.value = '';
      }
      this.imgInput.nativeElement.click();
    }
  }
  /**
   * [add the image file when is dropped into drop zone]
   */
  private addImageFile() {
    if (this.uploader.queue.length > 0) {
      // remove other files, leave the last element
      if (this.uploader.queue.length > 1) {
        this.uploader.queue.splice(0, this.uploader.queue.length - 1);
      }
      // validate that file is an image
      let type: string = this.uploader.queue[this.uploader.queue.length - 1].file.type;
      if (type.indexOf('image') !== -1) {
        // Pass file object to image uploader component
        this.fileDraged = this.uploader.queue[this.uploader.queue.length - 1]._file;
        this.image.name = this.uploader.queue[this.uploader.queue.length - 1]._file.name;
        this.image.size = this.getImageSize(this.uploader.queue[this.uploader.queue.length - 1]._file.size);
      }
      this.filesLenght = this.uploader.queue.length;
    }
  }
  /**
   * [handle when a file is selected using the dialog box]
   * @param {ImageResult} imageResult [the image file]
   */
  private selected(imageResult: ImageResult) {
    if (this.fileDraged === undefined) {
      this.uploader.queue.splice(0);
      let newFileItem = new FileItem(this.uploader, imageResult.file, this.uploader.options);
      this.uploader.queue.push(newFileItem);
    }

    this.image.w = imageResult.resized.width;
    this.image.h = imageResult.resized.height;
    this.image.name = imageResult.file.name;
    this.image.size = this.getImageSize(imageResult.file.size);
    this.image.url = imageResult.resized && imageResult.resized.dataURL || imageResult.dataURL;
    this.fileDraged = undefined;
    this.imgSelected.emit({image: this.image, uploader: this.uploader});
    if (!this.showImage) {
      this.image = {
        name: undefined,
        size: undefined,
        w: undefined,
        h: undefined,
        url: undefined
      };
    }
  }
  /**
   * Get the image size. return a string with the file size in Kb or Mb
   * @param {number} bytes [size in bytes]
   *
   */
  private getImageSize(bytes: number): string {
    let aux = 1000;
    if (bytes < aux) {
      return '' + bytes.toFixed(1) + ' b';
    } else {
      let kb = bytes / aux;
      if (kb < aux) {
        return '' + kb.toFixed(1) + ' K';
      } else {
        let mb = kb / aux;
        return '' + mb.toFixed(1) + ' M';
      }
    }
  }

  private getImageOverClass(): string {
    if (this.hasBaseDropZoneOver) {
      return this.dropZoneCssClass;
    }
  }

  /**
   * [handle when a file is dropped on the drag and drop component]
   *
   */
  private onFileDrop(e: any) {
    this.addImageFile();
  }
}
