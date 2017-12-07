import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { TagInputModule } from 'ng2-tag-input';
import { TooltipModule } from 'ngx-bootstrap';
import { ComposeMessageDialogComponent } from './compose-message-dialog.component';
import { MessagingUiService } from './messaging-ui.service';
import { SharedModule } from '../shared.module';
import { PipesModule }  from '../../../pipes/pipes.module';


@NgModule({
  imports: [
    CommonModule, FileUploadModule, FormsModule, ReactiveFormsModule,
    TagInputModule, SharedModule, TooltipModule.forRoot(), PipesModule,
  ],
  declarations: [ComposeMessageDialogComponent],
  providers: [MessagingUiService],
  entryComponents: [ComposeMessageDialogComponent]
})
export class MessagingUiModule {
}
