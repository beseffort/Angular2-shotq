import { NgModule, ApplicationRef, ViewContainerRef }                   from '@angular/core';
import { BrowserModule }                              from '@angular/platform-browser';
import { BrowserAnimationsModule }                    from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule }           from '@angular/forms';
import { HttpModule }                                 from '@angular/http';
import { RouterModule, PreloadAllModules }            from '@angular/router';
import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
}                                                     from '@angularclass/hmr';
/* Import all necessary modules from ngx-bootstrap */

/* MODULES */
import {
  AccordionModule,
  ModalDirective,
  DatepickerModule,
  ModalModule,
  PaginationModule,
  TabsModule,
  TooltipModule,
  ButtonsModule
}                                                      from 'ngx-bootstrap';
import { DropdownModule }                              from 'ngx-dropdown';
import { ModalModule as ng2Modal } from 'single-angular-modal';
import { BootstrapModalModule, Modal } from 'single-angular-modal/plugins/bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
/* Module with all components related to form-field-xxx */
import { FormFieldModule }                             from './components/shared/form-field';
import { ChooseContactModule }                         from './components/shared/choose-contact';
import { AccessModule }                                from './components/+access';
import { ProposalsModule }                             from './components/+proposals';
import { BookingModule }                               from './components/+booking';
import { SharedModule }                                from './components/shared';
import { BreadcrumbModule }                            from './components/shared/breadcrumb';

/* DIRECTIVES */
/* this is a replacement forked from valor-software "aslubsky fork": */
import { DynamicModalContent }                         from './directives/dynamic-modal-content';

import { OverflowBodyDirective } from './directives/overflow-body';
/* COMPONENTS */
/* Main / Parents */
import { InnerComponent }                              from './components/inner/inner.component';
import { OuterComponent }                              from './components/outer/outer.component';
/* Others */
import { TopNavbarModule }                             from './components/top-navbar';
import { SidebarComponent }                            from './components/sidebar';
import { ModalComponent }                              from './components/modal';
import { Home }                                        from './components/home';
import { EventsComponent }                             from './components/events';
import { NoContentComponent }                          from './components/no-content';
import { NoAuthorizedComponent }                       from './components/no-authorized';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS }                               from './environment';
import { ROUTES }                                      from './app.routes';
// App is our top level component
import { App }                                         from './app.component';
import { APP_RESOLVER_PROVIDERS }                      from './app.resolver';
import { AppState, InternalStateType }                 from './app.service';

/* SERVICES */
/* Import all the services */
import { BreadcrumbService }                           from './components/shared/breadcrumb/components/breadcrumb.service';
import * as services                                   from './services';
import { AccessService, ClientAccessAuthGuard } from './services/access';
import { SignalService }                               from './services/signal-service/signal.service';
import { SettingsModule } from './components/+settings/settings.module';
import { CalendarEntryModule } from './components/+calendar/calendar.module';
const mapValuesToArray = (obj) => Object.keys(obj).map(key => obj[key]);


// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState,
  ...mapValuesToArray(services)
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [App],
  declarations: [
    OverflowBodyDirective,
    SidebarComponent,
    DynamicModalContent,
    ModalComponent,
    Home,
    EventsComponent,
    NoContentComponent,
    NoAuthorizedComponent,
    App,
    InnerComponent,
    OuterComponent
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    BreadcrumbModule,
    HttpModule,
    SharedModule,
    DropdownModule,
    FormFieldModule,
    ChooseContactModule,
    TopNavbarModule,
    AccessModule,
    ProposalsModule,
    BookingModule,
    SettingsModule,
    CalendarEntryModule,
    ReactiveFormsModule,
    // ClientAccessModule,
    ModalModule.forRoot(),
    ng2Modal.forRoot(),
    BootstrapModalModule,
    RouterModule.forRoot(ROUTES, {useHash: true, preloadingStrategy: PreloadAllModules}),
    ColorPickerModule
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    AccessService,
    ClientAccessAuthGuard,
    BreadcrumbService,
    ENV_PROVIDERS,
    APP_PROVIDERS,
    SignalService,
  ]
})
export class AppModule {
  constructor(public appRef: ApplicationRef,
              public appState: AppState) {
  }

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) return;
    console.info('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  public hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

}
