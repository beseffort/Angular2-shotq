import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  OnDestroy, ViewContainerRef
}                         from '@angular/core';
import { DOCUMENT }                  from '@angular/platform-browser';
import { SettingsAndActions }        from './settings-and-actions';
/* Services */
import { GeneralFunctionsService }   from '../../services/general-functions';
import { BreadcrumbService } from '../shared/breadcrumb/components/breadcrumb.service';
import { Overlay } from 'single-angular-modal';

@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    styleUrls : ['./settings.component.scss']
})
export class SettingsComponent {
  @ViewChild('mainPanel') mainPanel: any;
  private settings = SettingsAndActions;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private generalFunctions: GeneralFunctionsService,
    private breadcrumbService: BreadcrumbService,
    private overlay: Overlay,
    private vcRef: ViewContainerRef
  ) {
    overlay.defaultViewContainer = vcRef;
    breadcrumbService.addFriendlyNameForRoute('/settings', 'Settings');
  }

  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.iterateToCloseCategories();
  }

  /**
   * Toggle category panel
   */
  onToggle(setting: any) {
    if (setting.actions && setting.actions.length) {
      if (!setting.isOpen) {
        this.onOpen(setting);
      } else {
        this.onClose(setting);
      }
      return;
    }

    if (setting.linkTo) {
      this.navigateTo(setting.linkTo);
      return;
    }
  }

  /**
   * Show category actions when is opened
   */
  private onOpen(setting: any) {
    this.mainPanel.nativeElement.className += ' openedPanel ';
    this.iterateToCloseCategories();
    setting.isOpen = true;
  }
  /**
   * Hide category actions
   */
  private onClose(setting: any) {
    this.mainPanel.nativeElement.classList.remove('openedPanel');
    setting.isOpen = false;
  }
  /**
   * Hide actions from all categories
   */
  private iterateToCloseCategories() {
    for (let setting of this.settings) {
      setting.isOpen = false;
    }
  }
  /**
   * Navigate to given url.
   */
  private navigateTo(url: string): void {
    if (url !== undefined) {
      this.generalFunctions.navigateTo(url);
    }
  }
  /**
   * Check if has link.
   *
   * @param  {string}  url [description]
   * @return {boolean}     [description]
   */
  private hasLink(url: string): boolean {
    return (url !== undefined) ? true : false;
  }
}
