// This is a minimal wrapper for TinyMCE editor with no additional bells and whistles.
import {
  AfterViewInit, Component, forwardRef, Input, NgZone, OnDestroy
} from '@angular/core';
import {
  AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR,
  ValidationErrors, Validator
} from '@angular/forms';

declare const tinymce: any;

const ELEMENT_ID_PREFIX = 'sq-text-editor-';
const DEFAULT_TOOLBAR = 'bold italic bullist | numlist | fontsizeselect | link image |';

@Component({
  selector: 'sq-text-editor',
  template: `<div id="{{elementId}}" class="sq-text-editor"></div>`,
  styleUrls: ['./text-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextEditorComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TextEditorComponent),
      multi: true,
    }
  ]
})
export class TextEditorComponent
    implements AfterViewInit, OnDestroy, ControlValueAccessor, Validator {
  // Automatically set the focus to an editor instance http://bit.ly/2saxxxZ#auto_focus
  @Input() autoFocus: boolean = false;
  // The inline editing mode is useful when creating user experiences where you want
  // the editing view of the page to be merged with the reading view of the page.
  // http://bit.ly/2rI5uo5#inline
  @Input() inline: boolean = true;
  // This option allows you to specify which menus should appear and the order
  // that they appear in the menu bar at the top of TinyMCE.
  // http://bit.ly/2rI5uo5#menubar
  @Input() menubar: string|boolean = false;
  // This option allows you to specify the buttons and the order that they
  // will appear on TinyMCE's toolbar.
  // http://bit.ly/2rI5uo5#toolbar
  @Input() toolbar: string|boolean = DEFAULT_TOOLBAR;
  // Use this option to render the inline toolbar into a fixed positioned HTML element.
  // http://bit.ly/2rI5uo5#fixed_toolbar_container
  @Input() toolbarContainer: string = '';

  public elementId: string = ELEMENT_ID_PREFIX + Math.random().toString(36).substring(2);
  private editor;
  private isDisabled: boolean = false;
  private innerValue: string = '';

  constructor(private zone: NgZone) {
  }

  ngAfterViewInit() {
    const options = {
      selector: '#' + this.elementId,
      theme: this.inline && !this.toolbarContainer ? 'inlite' : 'modern',
      menubar: this.menubar,
      plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen textpattern',
        'insertdatetime media table paste noneditable contextmenu'
      ],
      toolbar: this.toolbar,
      selection_toolbar: DEFAULT_TOOLBAR,
      insert_toolbar: '',
      skin_url: 'assets/skins/lightgray',
      extended_valid_elements: 'div[class]|em[class]',
      inline: this.inline,
      statusbar: false,
      fixed_toolbar_container: this.toolbarContainer,
      init_instance_callback: (editor) => {
        if (!editor)
          return;
        if (this.toolbarContainer)
          // This will trick the editor into thinking it was focused
          // without actually focusing it (causing the toolbar to appear)
          editor.fire('focus');
        if (this.value)
          editor.setContent(this.value);
      },
      setup: editor => {
        this.editor = editor;
        editor.on('keyup', () => {
          const instance = event.target;
          if (instance)
            this.value = editor.getContent();
        });
        editor.on('blur', (event) => {
          const instance = event.target;
          if (instance)
            this.value = instance.getContent();
          if (this.toolbarContainer)
            // This will prevent the toolbar from hiding when
            // the editor loses the focus.
            event.stopImmediatePropagation();
        });
      },
    };
    if (this.autoFocus)
      options['auto_focus'] = this.elementId;
    tinymce.init(options);
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }

  get value(): any {
    return this.innerValue;
  }

  set value(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
      this.zone.run(() => {
        this.onChangeCallback(value);
      this.onTouchedCallback(value);
      });
    }
  }

  writeValue(value: any): void {
    this.innerValue = value;
    if (this.editor)
      this.editor.setContent(value || '');
    this.onChangeCallback(value);
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  validate(c: AbstractControl): ValidationErrors {
    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChangeCallback = fn;
  }

  private onChangeCallback = (obj: any) => { };
  private onTouchedCallback = (obj: any) => { };
  private onValidatorChangeCallback = (obj: any) => { };
}
