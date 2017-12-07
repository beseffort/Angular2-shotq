import * as $ from 'jquery';
import {
 Component,
 DoCheck,
 AfterViewInit,
 OnDestroy,
 ViewEncapsulation,
 ViewContainerRef,
}                              from '@angular/core';
import {
 Router,
 RoutesRecognized
}                              from '@angular/router';
/* Services */
import { AppState }            from './app.service';
import { Overlay } from 'single-angular-modal/esm';

declare let require:           (any);
declare let velocity:          (any);
declare let matFloatingButton: (any);
declare let waves:             (any);

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    '../assets/css/app.style.scss',
    '../assets/css/bootstrap-datetimepicker.css',
    'components/+settings/contract-templates/template-variables/template-variable-item.scss'
  ],
  templateUrl: './app.component.html'
})
export class App implements OnDestroy {
  viewContainerRef:         ViewContainerRef;
  isSidebarCollapsed:       boolean = true;
  bodyAttributesObserver: MutationObserver;

  velocity = require ('./assets/theme/assets/js/components/velocity.min.js');
  matFloatingButton = require('./assets/theme/assets/js/components/material-floating-button.min.js');
  waves = require('./assets/theme/assets/vendor/waves/waves.js');

  constructor(
    public appState:            AppState,
    overlay: Overlay,
    viewContainerRef:           ViewContainerRef,
    private router?:            Router
    ) {
    this.viewContainerRef = viewContainerRef;
    overlay.defaultViewContainer = viewContainerRef;
  }

  ngAfterViewInit() {
    this.waves.init();
    this.startBodyAttributesWatching();
  }

  ngOnDestroy() {
    if (this.bodyAttributesObserver) {
      this.bodyAttributesObserver.disconnect();
    }
  }

  private startBodyAttributesWatching() {
    // select the target node
    let body = document.getElementsByTagName('body')[0];

    // create an observer instance
    this.bodyAttributesObserver = new MutationObserver((mutations) => {
      mutations.filter(m => m.attributeName === 'class').forEach((mutation) => {
        let modalIsOpen = body.classList.contains('modal-open');
        if (modalIsOpen && this.bodyHasVerticalScrollbar()) {
          let paddingRightWidth = this.measureScrollbar();
          document.documentElement.classList.add(`open-modal-padding-${paddingRightWidth}`);
        } else {
          this.removePaddingClass();
        }
      });
    });

    // configuration of the observer:
    let config = { attributes: true, childList: false, characterData: false };

    // pass in the target node, as well as the observer options
    this.bodyAttributesObserver.observe(body, config);
  }

  private measureScrollbar(): number {
    let scrollDiv = document.createElement('div');
    scrollDiv.className = 'modal-scrollbar-measure';
    $(document.body).append(scrollDiv);
    let scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    $(document.body)[0].removeChild(scrollDiv);
    return scrollbarWidth;
  }

  private removePaddingClass() {
    $('html').removeClass (function (index, className) {
      return (className.match(/(^|\s)open-modal-padding-\d+/g) || []).join(' ').trim();
    });
  }

  private bodyHasVerticalScrollbar(): boolean {
    return $(document).height() > $(window).height();
  }
}
