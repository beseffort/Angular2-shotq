import {
 Component,
 DoCheck,
 ViewEncapsulation,
}                              from '@angular/core';
import {
 Router,
 RoutesRecognized
}                              from '@angular/router';

@Component({
  selector: 'app-inner-component',
  templateUrl: './inner.component.html',
  styleUrls: [
    '../+settings/contract-templates/template-variables/template-variable-item.scss',
    'inner.component.scss'
  ]
})
export class InnerComponent {
  isSidebarCollapsed:       boolean = true;
  isClientAccessSidebar:    boolean = false;
  isLoggedIn:               boolean = false;
  hideTopnavbar:            boolean = true;
  hideSidebar:              boolean = true;
  deniedEntitiesTop:        Array<string>;
  deniedEntitiesSide:       Array<string>;
  allowedEntities:          Array<string>;
  allowedEntitiesRegExp:    {[key: string]: RegExp};
  hideBreadcrumb:           string = 'hide';
  breadcrumbClass:          string;

  constructor(
    private router?:        Router
    ) {
    /* Allowed entities to display breadcrumb */
    this.allowedEntities = [
      'pricing/items',
      // 'settings',
      'settings/products/items',
      'settings/products/packages',
      // 'dashboard',
      'contacts/profile',
      'jobs/info',
      'settings/templates/email',
      'settings/templates/contract',
      'settings/templates/proposal',
      'settings/company',
      'settings/profile',
      'settings/payment-and-invoices',
      'settings/team',
      'settings/job-roles',
      'settings/job-types',
      'settings/event-types'
    ];
    this.allowedEntitiesRegExp = {
      'jobs': /^\/jobs\/([0-9]+)\??(?:.+)?/
    };
    /* Denied entities to display sidebar or top-navbar */
    this.deniedEntitiesTop = [
      'not-authorized',
      'booking'
    ];
    this.deniedEntitiesSide = [
      'not-authorized',
      'public/client-access/account',
      'public/client-access/communication',
      'public/client-access/invoices',
      'public/client-access/overview',
      'booking'
    ];
  }
  /**
   * Init hook
   */
  ngOnInit() {
    this.isLoggedIn = false;
    /* Hide or show breadcrumb regarding entity allowed */
    setTimeout(() => {
      /* Check for client breadcrumb */
      this.handleBreadcrumbAndBars(this.router);
      this.router.events.subscribe(( RoutesRecognized: RoutesRecognized ) => {
        /* After redirect */
        if (RoutesRecognized.url !== undefined && RoutesRecognized.url !== null) {
          /* Check if user is logged in. */
          this.checkIfLoggedIn(RoutesRecognized);
          /* Check for breadcrumb */
          this.handleBreadcrumbAndBars(RoutesRecognized);
        }
      });
    });
  }
  /**
   * DoCheck hook
   */
  ngDoCheck() {
    /* Remove nopadding class on inner components */
    if (document.getElementsByTagName('body')[0].classList.contains('body_nopadding')) {
      document.getElementsByTagName('body')[0].classList.remove('body_nopadding');
    }
    let oAuthInfo = sessionStorage.getItem('OAuthInfo');
    if (oAuthInfo !== undefined && oAuthInfo !== null) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }
  /**
   * Function to change sidebar when collapsed.
   */
  public changeSidebarCollapsed() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  /**
   * Function to handle to show or hide breadcrumb, also handle to
   * show / hide top and side navbars.
   */
  private handleBreadcrumbAndBars(objUrl: any) {
    let currentUrl = objUrl.url.split('?')[0];
    let entityAux = currentUrl.match(/[^/].+[a-z]/g);
    let entityName = ((entityAux !== null) ? entityAux[0] : currentUrl);
    this.breadcrumbClass = entityName.replace('/', '-');
    if (entityAux !== null && entityAux !== undefined) {
      /* Check for top-navbar and sidebar denied entities */
      this.hideTopnavbar = this.deniedEntitiesTop.some(url => entityName.toLowerCase().includes(url.toLowerCase()));
      this.hideSidebar = this.deniedEntitiesSide.some(url => entityName.toLowerCase().includes(url.toLowerCase()));
      /* Check for breadcrumb allowed entities */
      if (entityAux[0].charAt(entityAux[0].length) === '/') {
        entityName = entityAux[0].slice(0, -1);
      }
      let allowedEntityRegExp = this.allowedEntitiesRegExp[entityName];
      if (entityName !== undefined && entityName !== null
          && (this.allowedEntities.indexOf(entityName) !== -1
              || allowedEntityRegExp && currentUrl.match(allowedEntityRegExp))) {
        this.hideBreadcrumb = '';
      } else {
        this.hideBreadcrumb = 'hide';
      }
    } else {
      this.hideBreadcrumb = 'hide';
      this.hideTopnavbar = false;
      this.hideSidebar = false;
    }
  }
  /**
   * Check if user is already logged in and redirect to dashboard.
   * @param {any} objUrl Object with url path.
   */
  private checkIfLoggedIn(objUrl: any) {
    if (this.isLoggedIn === true && objUrl.url === '/login') {
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      });
    }
  }
}
