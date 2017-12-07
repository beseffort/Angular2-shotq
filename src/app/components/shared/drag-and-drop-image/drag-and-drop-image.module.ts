import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { ImageUpload } from '../image-upload/image-upload';
import { DragAndDropImageComponent } from './drag-and-drop-image.component';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FileUploadModule
  ],
  declarations: [
    DragAndDropImageComponent,
    ImageUpload
  ],
  exports: [
    DragAndDropImageComponent,
    ImageUpload
  ]
})
export class DragAndDropImageModule {}
