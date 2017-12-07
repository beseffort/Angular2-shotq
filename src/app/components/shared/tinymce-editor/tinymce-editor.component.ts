import {
  Component,
  OnDestroy,
  AfterViewInit,
  EventEmitter,
  OnChanges,
  DoCheck,
  Input,
  Output,
  forwardRef,
  NgZone
}                                                  from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

// Core
import 'tinymce/tinymce';
import 'tinymce/themes/modern/theme';
import 'tinymce/themes/inlite/theme';
// Plugins
import 'tinymce/plugins/paste/plugin.min';
import 'tinymce/plugins/link/plugin.min';
import 'tinymce/plugins/autoresize/plugin.min';
import 'tinymce/plugins/table/plugin.min';
import 'tinymce/plugins/autolink/plugin.min';
import 'tinymce/plugins/advlist/plugin.min';
import 'tinymce/plugins/lists/plugin.min';
import 'tinymce/plugins/image/plugin.min';
import 'tinymce/plugins/charmap/plugin.min';
import 'tinymce/plugins/print/plugin.min';
import 'tinymce/plugins/searchreplace/plugin.min';
import 'tinymce/plugins/anchor/plugin.min';
import 'tinymce/plugins/visualblocks/plugin.min';
import 'tinymce/plugins/preview/plugin.min';
import 'tinymce/plugins/fullscreen/plugin.min';
import 'tinymce/plugins/code/plugin.min';
import 'tinymce/plugins/media/plugin.min';
import 'tinymce/plugins/insertdatetime/plugin.min';
import 'tinymce/plugins/contextmenu/plugin.min';
import 'tinymce/plugins/noneditable/plugin.min';
import 'tinymce/plugins/textpattern/plugin.min';

/* Services */
import { GeneralFunctionsService }                 from '../../../services/general-functions';
import { TemplateVariable }                        from '../../../models/template-variable.model';
import { SignalService }                           from '../../../services/signal-service/signal.service';
import { Subscription } from 'rxjs/Subscription';
import { TemplateVariableService } from '../../../services/template-variable/template-variable.service';

declare var window: any;
declare let tinymce: any;


@Component({
  selector: 'tinymce',
  templateUrl: 'tinymce-editor.component.html',
  styleUrls: ['tinymce-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TinymceComponent),
      multi: true
    },
    GeneralFunctionsService
  ],
})
export class TinymceComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input() elementId: string;
  @Input() class: string;
  @Input() name: string;
  @Input() placeholder: string = '';
  @Input() noteBody: string = '';
  @Input() noteBodyNoHtml: string = '';
  @Input() editableMode: string = '';
  @Input() readonly: boolean = true;
  @Input() reload: boolean = false;
  @Input() templateVariables: TemplateVariable[] = [];
  @Input() currentError: any = null;
  @Input() hideErrors: boolean = false;

  @Input() toolbar: string;
  @Input() theme: string = 'inlite';
  @Input() menubar: boolean = false;
  @Input() elementpath: boolean = false;
  @Input() inline: boolean = true;
  @Input() statusbar: boolean = false;
  @Input() fixed_toolbar_container: string = '';
  @Input() blurEvent: boolean = true;

  @Output() onEditorKeyup = new EventEmitter<any>();
  @Output() onEditorBlur = new EventEmitter<any>();
  @Output() change = new EventEmitter();
  @Output() ready = new EventEmitter();
  @Output() blur = new EventEmitter();
  @Output() templateVariableErrors = new EventEmitter();
  @Input() canReceiveVariable = false;


  @Input() initVal;

  public editor: any;
  public _value: string = '';
  public zone: any;
  public tags: any = false;
  private lastCaretPosition: any;
  private signalSubs: Subscription[] = [];

  static renderVariable(variable: TemplateVariable, hideErrors: boolean = false) {

    let errorAttn = `
        <span class="attn">
            <span class="attn__icon">!</span>
        </span> `;
    let error = !variable.value;

    return `<span class="wrap-stub" draggable="true">&nbsp;
                <span class="wrap-error mceNonEditable ${error && !hideErrors ? 'is-error' : 'is-success'}"
                    data-key="${variable.key}">
                    ${error && !hideErrors ? errorAttn : ''}
            <span class="variables-item__tag">
                ${variable.name || variable.value }${error && !hideErrors ? '<i class="var-delete">&#10005;</i>' : ''}
            </span>
        </span>&nbsp;</span>`;
  }

  /**
   * Constructor
   */
  constructor(zone: NgZone,
              private signal: SignalService,
              private generalFunctions: GeneralFunctionsService) {
    this.value = this.initVal;
    this.zone = zone;
  }

  ngAfterViewInit() {
    this.removeHtmlTagsFromNotes();
    this.tinymceInit();


    // listen for signal from right panel to mark variable as active
    this.signalSubs = [
      this.signal.stream
        .filter(message => message.type === 'select' && message.group === 'templateVar')
        .map(message => message.instance)
        .subscribe((error: TemplateVariable) => {
          jQuery('.wrap-error.is-active').removeClass('is-active').addClass('is-error');
          let elem = jQuery(`.wrap-error[data-key='${error.key}']`);
          if (elem.length) {
            elem.addClass('is-active').removeClass('is-error');
          }
        }),
      this.signal.stream
        .filter(message => message.type === 'dismissError' && message.group === 'templateVar')
        .map(message => message.instance)
        .subscribe(this.deleteVariableFromEditor.bind(this)),

      this.signal.stream
        .filter(message => message.type === 'replaceError' && message.group === 'templateVar')
        .map(message => message.instance)
        .subscribe((variable: TemplateVariable) => {
          this.deleteVariableFromEditor(variable.key, variable.value);
        }),
      this.canReceiveVariable && this.signal.stream
        .filter(message => message.type === 'addVariable' && message.group === 'templateVar')
        .debounceTime(100)
        .map(message => message.instance)
        .subscribe((variable: TemplateVariable) => {
          this.addVariable(variable);
        }),
    ];
  }

  /**
   * [selectVariable description]
   * @param {[type]} varKey [description]
   */
  public selectVariable(varKey) {
    this.signal.send({
      group: 'templateVar',
      type: 'selectError',
      instance: varKey,
    });
  }

  /**
   * [deleteVariableFromEditor description]
   * @param {[type]} varKey      [description]
   * @param {string} replaceWith [description]
   */
  public deleteVariableFromEditor(varKey, replaceWith?: string) {
    replaceWith = replaceWith || '';
    jQuery(`.wrap-error[data-key='${varKey}']`).parent('.wrap-stub').replaceWith(replaceWith);
    // this.editorBlur();
  }

  /**
   * [dismissVariable description]
   * @param {[type]} varKey [description]
   */
  public dismissVariable(varKey) {
    this.signal.send({
      group: 'templateVar',
      type: 'dismissError',
      instance: varKey,
    });
  }

  /**
   * Detect component changes.
   */
  ngOnChanges(changes) {
    // Handle editable mode.
    if (window.tinymce && window.tinymce.editors[this.elementId] !== undefined) {
      // Disable editor on editable mode off.
      if (this.editableMode && (this.editableMode === 'inactive' || this.editableMode === 'inactive-first')) {
        let contents = this.renderHtml(this.noteBody);
        window.tinymce.editors[this.elementId].bodyElement.contentEditable = false;
        window.tinymce.editors[this.elementId].bodyElement.disabled = true;
        window.tinymce.editors[this.elementId].readonly = true;
        this.readonly = true;
        window.tinymce.editors[this.elementId].setContent(contents || '');
        // window.tinymce.editors[this.elementId].setContent(this.noteBody || '');
        this.syncPlaceholder(this.noteBody);
      }
      // Enable editor on editable mode on.
      if (this.editableMode && (this.editableMode === 'active' || this.editableMode === 'active-first')) {
        window.tinymce.editors[this.elementId].bodyElement.contentEditable = true;
        window.tinymce.editors[this.elementId].bodyElement.disabled = false;
        window.tinymce.editors[this.elementId].readonly = false;
        this.readonly = true;
        let aux = this.noteBody;
        if (aux && aux.search('<p>&nbsp;</p>') === -1) {
          aux += '<p>&nbsp;</p>';
        }
        let contents = this.renderHtml(aux);
        window.tinymce.editors[this.elementId].setContent(contents || '');
        this.syncPlaceholder(contents);
      }
    }
  }

  /**
   * [value description]
   * @return {any} [description]
   */
  get value(): any {
    return this._value;
  }

  /**
   * [Input description]
   * @param {[type]} ) set value(v [description]
   */
  @Input() set value(v) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);
    }
  }

  /**
   * [renderCode description]
   * @param {[type]} code [description]
   */
  public renderCode(code) {
    let $code = jQuery('<div>');
    $code.append(jQuery(code));
    $code.find('span.wrap-error').map(function () {
      // Jquery map, so `this` in array item
      let parent = jQuery(this).parents('.wrap-stub');
      if (parent.length > 0) {
        parent.replaceWith(`{{${this.dataset.key}}}`);
      } else {
        this.replaceWith(`{{${this.dataset.key}}}`);
      }
    });
    return $code.html();
  }

  /**
   * [renderHtml description]
   * @param {string} html [description]
   */
  public renderHtml(html: string) {
    if (this.templateVariables && this.templateVariables.length > 0) {

      let errors: TemplateVariable[] = [];
      let re = /(\{\{([\w.\-]+)}})/gm;
      let match = re.exec(html);
      while (match != null) {
        let varTag = match[0];
        let varName = match[2];
        let tempVar = this.templateVariables.find(item => item.key === varName);
        if (!tempVar) {
          tempVar = TemplateVariableService.newObject({
            name: varName,
            key: varName,
          });
          if (errors.findIndex(item => item.key === tempVar.key) === -1) {
            errors.push(tempVar);
          }
        }
        let varHtml = TinymceComponent.renderVariable(tempVar, this.hideErrors);
        html = html.replace(varTag, varHtml);
        match = re.exec(html);
      }
      setTimeout(() => {
        this.templateVariableErrors.emit(errors);
      });
    }
    return html;
  }

  /**
   * Value update process
   */
  public updateValue(value) {
    this.zone.run(() => {
      this.value = value;
      this.onChange(value);
      this.onTouched();
      this.change.emit(value);
    });
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
    this.signalSubs
      .filter(sub => !!sub)
      .forEach(sub => {
        sub.unsubscribe();
      });
  }

  /**
   * Implements ControlValueAccessor
   */
  public writeValue(value) {
    this._value = value;
  }

  /**
   * [onChange description]
   * @param {[type]} _ [description]
   */
  public onChange(_) {
  }

  /**
   * [onTouched description]
   */
  public onTouched() {
  }

  /**
   * [registerOnChange description]
   * @param {Function} fn [description]
   */
  public registerOnChange(fn) {
    this.onChange = fn;
  }

  /**
   * [registerOnTouched description]
   * @param {Function} fn [description]
   */
  public registerOnTouched(fn) {
    this.onTouched = fn;
  }

  /**
   * Function to toggle tags on editor.
   *
   * @param {[type]} $event [description]
   */
  public toggleTags($event) {
    if (this.editableMode === 'inactive' || this.editableMode === undefined) {
      if (this.tags === false) {
        if (document.querySelectorAll('.maxHeight').length > 0) {
          let addNoteBody = <HTMLElement> document.querySelector('.maxHeight .add-note-body');
          addNoteBody.click();
        }
        document.querySelector('#' + this.elementId).parentElement.parentElement.classList.add('maxHeight');
        // document.querySelector('#' + this.elementId).parentElement.parentElement.classList.remove('ellipsis');
        document.querySelector('#' + this.elementId).parentElement.parentElement.scrollTop = 0;
        window.tinymce.editors[this.elementId].setContent(this.noteBody);
        this.tags = true;
      } else {
        document.querySelector('#' + this.elementId).parentElement.parentElement.classList.remove('maxHeight');
        document.querySelector('#' + this.elementId).parentElement.parentElement.scrollTop = 0;
        if (document.querySelector('#' + this.elementId).clientHeight > 26) {
          // document.querySelector('#' + this.elementId).parentElement.parentElement.classList.add('ellipsis');
        }
        window.tinymce.editors[this.elementId].setContent(this.noteBody);
        this.tags = false;
      }
    } else {
      document.querySelector('#' + this.elementId).parentElement.parentElement.classList.remove('maxHeight');
    }
  }

  editorBlur() {
    if (this.editor.selection) {
      jQuery(`span[data-mce-type='bookmark']`).remove();
    }

    if (this.blurEvent) {
      let content = this.getContents();
      this.syncPlaceholder(content);
      this.onEditorBlur.emit(content);
    }
  }

  /**
   * Function to get editor content.
   */
  public getContents() {
    return this.renderCode(this.editor.getContent());
  }

  public focus() {
    this.editor.fire('focus');
  }

  /**
   * Function that initialize the tinymce editor
   */
  private tinymceInit() {
    window.tinymce.init({
      selector: '#' + this.elementId,
      readonly: this.readonly,
      theme: this.theme,
      menubar: this.menubar,
      plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen textpattern',
        'insertdatetime media table paste noneditable contextmenu'
      ],
      toolbar: this.toolbar,
      elementpath: this.elementpath,
      selection_toolbar: `bold italic numlist bullist | fontsizeselect | link image`,
      insert_toolbar: '',
      skin_url: 'assets/skins/lightgray',
      extended_valid_elements: 'div[class]|em[class]',
      inline: this.inline,
      statusbar: this.statusbar,
      fixed_toolbar_container: this.fixed_toolbar_container,
      setup: editor => {
        this.editor = editor;

        editor.on('click', (e) => {
          // if (e.target)
          let el = jQuery(e.target);
          // var item click
          if (el.hasClass('variables-item__tag')) {
            el.addClass('is-active');
            let varKey = (<any>el.parents('.wrap-error')[0].dataset).key;
            this.editor.selection.select(el.parents('.wrap-stub')[0]);
            this.selectVariable(varKey);

          } else if (el.hasClass('var-delete')) {
            let varKey = (<any>el.parents('.wrap-error')[0].dataset).key;
            this.dismissVariable(varKey);
          }
        });
        editor.on('init', () => {
          let editorElem = window.tinymce.editors[this.elementId];
          if (window.tinymce && editorElem && this.noteBody) {
            editorElem.setContent(this.renderHtml(this.noteBody));
            if (document.querySelector('#' + this.elementId).clientHeight > 39) {
              // document.querySelector('#' + this.elementId).parentElement.parentElement.classList.add('ellipsis');
            }
          }
        });
        editor.on('keyup', () => {
          let content = this.getContents();
          this.syncPlaceholder(content);
          this.onEditorKeyup.emit(content);
        });
        editor.on('change', () => {
        });

        editor.on('blur', this.editorBlur.bind(this));
        editor.on('drop', (e) => {
          setTimeout(() => {
            let b = jQuery(`span[data-mce-type='bookmark']`);
            b.each(function () {
              let c = jQuery(this).children('.wrap-error');
              jQuery(c).insertBefore(this);
            });

            jQuery('.wrap-error').each(function () {
              let p = jQuery(this).parent('.wrap-stub');
              if (p.length === 0) {
                jQuery(this).wrap('<span class="wrap-stub">');
              }
            });

          }, 10);

        });
      },
    });
  }

  /**
   * Funciton to check for active/inactive placeholder.
   *
   * @param {[type]} content [description]
   */
  private syncPlaceholder(content) {
    if (!!content) {
      this.editor.getBody().classList.add('is-active');
    } else {
      this.editor.getBody().classList.remove('is-active');
    }
  }

  /**
   * Function to remove Html tags from notes body.
   */
  private removeHtmlTagsFromNotes() {
    this.noteBodyNoHtml = this.generalFunctions.removeHtmlTags(this.noteBody);
  }

  /**
   * [addVariable description]
   * @param {TemplateVariable} variable [description]
   */
  private addVariable(variable: TemplateVariable) {
    if (this.editor.selection && this.canReceiveVariable) {
      this.editor.execCommand('mceInsertContent', false, TinymceComponent.renderVariable(variable));
    }
  }
}
