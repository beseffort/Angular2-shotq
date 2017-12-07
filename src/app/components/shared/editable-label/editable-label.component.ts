import {
  Component,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  DoCheck,
  HostListener }                from '@angular/core';

@Component({
  selector: 'editable-label',
  templateUrl: './editable-label.component.html',
  styleUrls : ['./editable-label.component.scss']
})
export class EditableLabelComponent {
  @Input() value:               string = '';
  @Input() type:                string = 'text';
  @Input() name:                string = '';
  @Input() step:                number = 1;
  @Input() placeholder:         string = '';
  @Input() cssClass:            string = '';
  @Input() cssClassLabel:       string = '';
  @Input() cssClassPlaceholder: string = '';
  @Input() truncateWords:       string;
  @Input() required:            boolean = false;
  @Input() isEditable:          boolean = false;
  @Input() forceEditable:       boolean = false;
  @Input() showEditIcon:        boolean = false;
  @Input() editOnClick:         boolean = true;
  @Input() invalidStrings:      Array<string> = [];
  @Output() valueChange =       new EventEmitter();
  @Output() editable =          new EventEmitter();
  @Output() onBlurEvent =       new EventEmitter();
  @Output() invalidInput =      new EventEmitter();

  @ViewChild('input') input: any;

  private hasFocus:        boolean = false;
  private oldValue:        string;
  private hasError:        boolean = false;
  private isTextSelected:  boolean = false;
  private isTyping:        boolean = false;
  private errors:          Array<any>;
  private hover:           boolean = false;

  ngOnInit() {
    if (this.isEditable && this.value) {
      this.isEditable = false;
    } else if (this.isEditable) {
      this.editable.emit({isEditable: true});
    }
  }

  ngDoCheck() {
    if (this.forceEditable && this.isTyping === false) {
      this.isEditable = true;
      this.value = '';
      this.toggleEditable();
      this.setFocus();
    }
  }

  ngAfterViewChecked() {
    // focus the visible input
    this.setFocus();
  }
  /**
   * Function to set focus to input.
   */
  public setFocus() {
    if (this.isEditable && !this.hasFocus && this.input !== undefined) {
      window.setTimeout(() => {
        this.input.nativeElement.focus();
        if (['text', 'search', 'url', 'tel', 'password'].indexOf(this.input.nativeElement.type) !== -1) {
          this.input.nativeElement.setSelectionRange(0, this.value.length, 'backward');
        }
      });
      this.hasFocus = true;
    }
  }
  /**
   * Function to set focus to input.
   */
  public setTextSelected() {
    if (this.isEditable && this.input !== undefined) {
      window.setTimeout(() => {
        this.input.nativeElement.select();
        this.isTextSelected = true;
        }
      );
    }
  }
  public setEditable() {
    this.isEditable = true;
  }
  /**
   * get the string to display on the label
   * is a placeholder if value is undefined
   * @return {string} [value to display in label tag]
   */
  private getLabelValue(): string {
    if (this.value) {
      return this.value;
    } else {
      return this.placeholder;
    }
  }
  private getLabelClass() {
    let classes: string = '';
    if (this.value) {
      classes = this.cssClassLabel;
    } else {
      classes = this.cssClassPlaceholder;
    }
    if (this.showEditIcon) {
      classes += ' editableLabel ';
    } else if (classes !== undefined && classes !== '') {
      classes.replace('editableLabel', '');
    }
    return classes;
  }
  /**
   * Toggle the isEditable status to display the input or the label
   * @param {any} e [event object]
   */
  private toggleEditable(e?: any) {
    if (!this.isEditable) {
      this.isEditable = !this.isEditable;
      this.oldValue = this.value;
      this.editable.emit({isEditable: true});
      this.hover = false;
      this.setFocus();
    }
  }
  /**
   * handle the input blur event
   * @param {any} e [description]
   */
  private onBlur(e: any) {
    this.onBlurEvent.emit(this.value);
    if (this.value) {
      this.saveValue();
    } else {
      this.hasError = true;
      this.isEditable = false;
    }
  }
  /**
   * Check if editable mode is allowed when label is clicked
   */
  private onLabelClick() {
    if (this.editOnClick) {
      this.toggleEditable();
    }
  }
  /**
   * Set the value an toggle the input
   */
  private saveValue() {
    if (this.isEditable) {
      if ((this.oldValue && this.value.toLowerCase() === this.oldValue.toLowerCase()) || this.invalidStrings.indexOf(this.value.toLowerCase()) === -1) {
        this.isEditable = !this.isEditable;
        this.hasFocus = false;
        this.valueChange.emit(this.value);
        this.editable.emit({isEditable: false});
        this.hasError = false;
      } else {
        this.hasError = true;
        this.invalidInput.emit();
      }
    }
  }

  private getErrors() {
    if (this.required && this.input &&
      this.input.nativeElement.className.indexOf('ng-touched') !== -1
      && this.input.nativeElement.className.indexOf('ng-invalid') !== -1) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Handle the keyup event
   * to check what key was pressed
   * @param {any} e [description]
   */
  private inputKeyUp(e: KeyboardEvent) {
    this.isTyping = true;
    this.hasError = false;
    if (e.keyCode === 27 && this.isEditable) { // Esc key
      e.preventDefault();
      if (this.oldValue !== '' && this.oldValue !== undefined) {
        this.value = this.oldValue;
      }
      this.hasFocus = false;
      if (this.value) {
        this.isEditable = !this.isEditable;
        this.editable.emit({isEditable: false});
        this.hasError = false;
      } else {
        this.hasError = true;
      }
    }
    if (e.keyCode === 13 && this.isEditable) { // Enter key
      if (this.value) {
        this.saveValue();
      } else {
        this.hasError = true;
      }
    }
  }
}
