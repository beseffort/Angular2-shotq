import { FormGroup, AbstractControl } from '@angular/forms';
import { DialogRef, ModalComponent } from 'single-angular-modal/esm';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';

export class BaseDialogContext<ContentType> extends BSModalContext {
  public content: ContentType;
}

export abstract class BaseDialogImplementation
    <ContentType, ContextType extends BaseDialogContext<ContentType>>
  implements ModalComponent<ContextType> {
  context: ContextType;
  protected form: FormGroup;

  constructor(public dialog: DialogRef<ContextType>, className?: string) {
    this.context = dialog.context;
    if (className)
      this.context.dialogClass = className;
    this.form = this.createForm();
    // give the constructor a chance to finish before resetting the view value
    setTimeout(() => this.setViewValue(this.context.content));
  }

  createForm(controls?: { [key: string]: AbstractControl; }, validator?): FormGroup {
    return new FormGroup(controls || {}, validator);
  }

  abstract setViewValue(content: ContentType);

  abstract getSubmitValue(content: ContentType): ContentType;

  protected submit() {
    this.dialog.close(this.getSubmitValue(this.context.content));
  }

  protected cancel() {
    this.dialog.dismiss();
  }
}
