import {
  Component
}                             from '@angular/core';
import { Location } from '@angular/common';
import {
  Router,
  ActivatedRoute,
  RoutesRecognized
}                             from '@angular/router';
import { Subscription } from 'rxjs';
import { AccessService } from '../../services/access';

@Component({
  selector: 'app-outer-component',
  templateUrl: './outer.component.html',
  styleUrls: []
})
export class OuterComponent {
  isSidebarCollapsed: boolean = true;
  isClientAccessSidebar: boolean = false;
  hideTopnavbar: boolean = true;
  noPaddingUrls: Array<string>;

  accessSub$: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private accessService: AccessService
  ) {
    this.noPaddingUrls = [
      '/login',
      '/forgot-password',
      '/sign-up',
      '/booking',
      '/public/client-access'
    ];
  }

  /**
   * Init hook
   */
  ngOnInit() {
    setTimeout(() => {
      /* Check outer urls */
      let currentPath = this.location.path();
      if (currentPath === '') {
        if (!this.accessService.getCanAccess()) {
          this.router.navigate(['/login']);
        } else {
          this.router.navigate(['/contacts']);
        }
      }
      this.checkOuterUrls(this.router);
      /* Check for client access */
      this.checkClientAccess(this.router);
      this.accessSub$ = this.router.events.subscribe((RoutesRecognized: RoutesRecognized) => {
        /* After redirect */
        if (RoutesRecognized.url !== undefined && RoutesRecognized.url !== null) {
          /* Check outer urls */
          this.checkOuterUrls(this.router);
          /* Check for client access */
          this.checkClientAccess(RoutesRecognized);
        }
      });
    });
  }

  /**
   * Destroy hook
   */
  ngOnDestroy() {
    this.accessSub$.unsubscribe();
    // document.getElementsByTagName('body')[0].classList.remove('body_nopadding');
  }

  /**
   * Check outer urls in order to avoid padding
   *
   * @param {any} objUrl Object with url path.
   */
  private checkOuterUrls(objUrl: any) {
    let needPadding = this.noPaddingUrls.some(url => objUrl.url.toLowerCase().indexOf(url.toLowerCase()) > -1);
    setTimeout(() => {
      let classList = document.getElementsByTagName('body')[0].classList;
      if (needPadding) {
        classList.add('body_nopadding');
      } else {
        classList.remove('body_nopadding');
      }
    });
  }

  /**
   * Check if section is client access and show proper top-navbar.
   *
   * @param {any} objUrl Object with url path.
   */
  private checkClientAccess(objUrl: any) {
    if (objUrl !== undefined && objUrl.url.indexOf('/public/client-access') !== -1) {
      // document.getElementsByTagName('body')[0].classList.remove('body_nopadding');
      setTimeout(() => { // In order to avoid conflicts with other validations.
        this.hideTopnavbar = false;
        this.isClientAccessSidebar = true;
      }, 10);
    } else if (this.noPaddingUrls.some(url => objUrl.url.toLowerCase().indexOf(url.toLowerCase()) > -1 )) {
      // document.getElementsByTagName('body')[0].classList.add('body_nopadding');
      this.hideTopnavbar = true;
      this.isClientAccessSidebar = false;
    } else {
      this.hideTopnavbar = true;
      this.isClientAccessSidebar = false;
    }
  }
}
