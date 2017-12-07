import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
}                              from '@angular/core';
import { GeneralFunctionsService } from '../../../services/general-functions/general-functions.service';

@Component({
  selector: 'dropdown',
  templateUrl: 'dropdown.component.html',
  styleUrls: ['dropdown.component.scss'],
})
export class DropdownComponent implements OnInit {
  public checkboxActions = [];
  @Input() name:               string;
  @Input() href:               string;
  @Input() id:                 string;
  @Input() customClass:        string;
  @Input() splitted:           boolean = false;
  @Input() simple:             boolean = false;
  @Input() disabled:           boolean;
  @Input() actions:            any;
  @Input() extraActions:       any;
  @Input() dropdownClass:      string;
  @Input() blockDropdown:      boolean = false;
  @Input() isMail:             boolean = false;
  @Input() dropUp:             boolean = false;
  @Output() optionSelected =   new EventEmitter();
  @Output() openCloseEvent =   new EventEmitter();
  // Is button or is an anchor
  _isButton: boolean = true;
  @Input()
  set button(isButton: boolean) {
    this._isButton = isButton;
  }

  get button() {
    return this._isButton;
  }

  // Is category dropdown
  _isCategory: boolean = false;
  @Input()
  set category(isCategory: boolean) {
    this._isCategory = isCategory;
  }

  get category() {
    return this._isCategory;
  }

  public status: {isopen: boolean} = {isopen: false};

  // Default icon
  _iconClass: string = ' icon-down-arrow font-size-5 ';

  @Input()
  set iconClass(iconClass: string) {
    this._iconClass = (iconClass && iconClass.trim()) || ' icon-down-arrow font-size-5 ';
  }
  get iconClass() {
    return this._iconClass;
  }
  // Default icon
  _listClass: string = ' btn-group no-shadow ';
  @Input()
  set listClass(listClass: string) {
    this._listClass += (listClass && listClass.trim()) || ' btn-group no-shadow ';
  }
  get listClass() {
    return this._listClass;
  }

  // default button class
  // ie: danger, success, info, etc
  _btnClass: string = 'btn btn-default';

  private isOpen: boolean = false;
  private categoriesQueue: Array<Object> = [];
  private removeArrow: string = '';

  @Input()
  set btnClass(btnClass: string) {
    this._btnClass = (btnClass && btnClass.trim()) || 'default';
  }
  get btnClass() {
    return this._btnClass;
  }

  private el: any;

  constructor(private generalFunctions: GeneralFunctionsService) {}

  ngOnInit() {}

  /**
   * [isBtnSplitted description]
   */
  isBtnSplitted() {
    return this.splitted && this.isButton() && !this.isCategoryDropDown();
  }
  /**
   * [isBtnNoSplitted description]
   */
  isBtnNoSplitted() {
    return !this.splitted && this.isButton() && !this.isCategoryDropDown();
  }
  /**
   * [isButton description]
   */
  isButton() {
    return this._isButton;
  }
  /**
   * [isAnchorButton description]
   */
  isAnchorButton() {
    return this.isButton() && (this.name !== undefined) && (this.href !== undefined) && !this.isCategoryDropDown();
  }
  /**
   * [hasButtonName description]
   */
  hasButtonName() {
    return (this.name !== undefined) && this.isButton() && !this.isAnchorButton();
  }
  /**
   * [noReturn description]
   * @param {[type]} e [description]
   */
  noReturn(e) {
    e.preventDefault();
  }
  /**
   * [isCategoryDropDown description]
   */
  isCategoryDropDown() {
    return this._isCategory;
  }
  /**
   * [onClick description]
   * @param {[type]} event  [description]
   * @param {[type]} action [description]
   */
  onClick(event, action?) {
    if (action !== undefined && typeof action === 'object') {
      if (action.href === undefined || action.href === '#') {
        event.preventDefault();
      } else {
        this.generalFunctions.navigateTo(action.href);
      }

      if (!action.hasOwnProperty('checked')) {
        let aux: any = document.querySelector('div.btn-group.no-shadow.open');
        if (aux) {
          let ev = new Event('closed');
          aux.dispatchEvent(ev);
        }
      }

      action.checked = this.toggleChecked(action.checked);
    }

    this.optionSelected.emit(action);
    if (event) {
      event.stopPropagation();
    }
    return false;
  }
  /**
   * open event handler
   * @param {any} e [description]
   */
  private onOpenHandler(e: any) {
    this.openCloseEvent.emit('opened');
    this.el = document.querySelector('div.btn-group.no-shadow.open');
    this.removeArrow = '';
  }
  /**
   * open event handler
   * @param {any} e [description]
   */
  private onCloseHandler(e: any) {
    this.openCloseEvent.emit('closed');
    if (this.el) {
      this.isOpen = false;
      let event = new Event('closed');
      this.el.dispatchEvent(event);
      this.removeArrow = 'arrow-up-close';
    }
  }
  private onCloseFireEvent() {
    setTimeout(() => {
      this.optionSelected.emit('refresh');
    });
  }
  /**
   * Action to toggle checked / unckecked item.
   * @param {[type]} item [description]
   */
  private toggleChecked(checked) {
    return ((checked === true) ? false : true);
  }

  private clickHandler(e: any) {
    if (this.isOpen) {
        this.openCloseEvent.emit('closed');
        this.isOpen = false;
        if (this.el)
          this.el.classList.remove('open');
        this.onCloseHandler({});
    } else {
      this.isOpen = true;
      this.openCloseEvent.emit('opened');
    }
  }
  /**
   * Function to get icon class name.
   * @param {string} iconName [description]
   */
  private getClassIconName(iconName: string) {
    if (iconName !== undefined) {
      return 'color-' + iconName.replace(' ', '-');
    }
  }

}

export class Action {
  id: string;
  name: string;
  action: string;
  icon: string;
  href: string;
  checked: boolean;

  constructor(id: string, name: string, icon: string) {
    this.id = id;
    this.name = name;
    this.icon = icon;
  }
}
