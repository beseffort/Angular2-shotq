import { Injectable } from '@angular/core';
import { GeneralFunctionsService } from '../../../../services/general-functions';

import * as _ from 'lodash';


@Injectable()
export class BreadcrumbService {
  private routesFriendlyNames: Map<string, string> = new Map<string, string>();
  private routesFriendlyNamesRegex: Map<string, string> = new Map<string, string>();
  private routesWithCallback: Map<string, (ostring) => string> = new Map<string, (ostring) => string>();
  private routesWithCallbackRegex: Map<string, (ostring) => string> = new Map<string, (ostring) => string>();
  private hideRoutes: any = new Array<string>();
  private hideRoutesRegex: any = new Array<string>();
  private routesMuted: any = new Array<string>();

  constructor(private generalFunctionsService: GeneralFunctionsService) {
  }

  /**
   * Specify a friendly name for the corresponding route.
   *
   * @param route
   * @param name
   */
  addFriendlyNameForRoute(route: string, name: string): void {
    this.routesFriendlyNames.set(route, name);
  }

  /**
   * Specify a friendly name for the corresponding route matching a regular expression.
   *
   * @param route
   * @param name
   */
  addFriendlyNameForRouteRegex(routeRegex: string, name: string): void {
    this.routesFriendlyNamesRegex.set(routeRegex, name);
  }

  /**
   * Specify a callback for the corresponding route.
   * When a mathing url is navigatedd to, the callback function is invoked to get the name to be displayed in the breadcrumb.
   */
  addCallbackForRoute(route: string, callback: (id: string) => string): void {
    this.routesWithCallback.set(route, callback);
  }

  /**
   * Specify a callback for the corresponding route matching a regular expression.
   * When a mathing url is navigatedd to, the callback function is invoked to get the name to be displayed in the breadcrumb.
   */
  addCallbackForRouteRegex(routeRegex: string, callback: (id: string) => string): void {
    this.routesWithCallbackRegex.set(routeRegex, callback);
  }

  /**
   * Show the friendly name for a given route (url). If no match is found the url (without the leading '/') is shown.
   *
   * @param route
   * @returns {*}
   */
  getFriendlyNameForRoute(route: string): string {
    let name;
    let routeEnd = route.substr(route.lastIndexOf('/') + 1, route.length);
    this.routesFriendlyNames.forEach((value, key, map) => {
      if (key === route) {
        name = value;
      }
    });
    this.routesFriendlyNamesRegex.forEach((value, key, map) => {
      if (new RegExp(key).exec(route)) {
        name = value;
      }
    });
    this.routesWithCallback.forEach((value, key, map) => {
      if (key === route) {
        name = value(routeEnd);
      }
    });
    this.routesWithCallbackRegex.forEach((value, key, map) => {
      if (new RegExp(key).exec(route)) {
        name = value(routeEnd);
      }
    });
    return name ? name : _.startCase(_.toLower(routeEnd));
  }

  /**
   * Specify a route (url) that should not be shown in the breadcrumb.
   */
  hideRoute(route: string): void {
    if (this.hideRoutes.indexOf(route) === -1) {
      this.hideRoutes.push(route);
    }
  }

  /**
   * Specify a route (url) regular expression that should not be shown in the breadcrumb.
   */
  hideRouteRegex(routeRegex: string): void {
    if (this.hideRoutesRegex.indexOf(routeRegex) === -1) {
      this.hideRoutesRegex.push(routeRegex);
    }
  }

  /**
   * Mute (remove anchor) name for the corresponding route.
   *
   * @param route
   */
  muteRoute(route: string): void {
    this.routesMuted.push(route);
  }

  /**
   * Returns true if a route should be hidden.
   */
  isRouteHidden(route: string): boolean {
    let hide = this.hideRoutes.indexOf(route) > -1;
    this.hideRoutesRegex.forEach((value: any) => {
      if (new RegExp(value).exec(route)) {
        hide = true;
      }
    });
    return hide;
  }

  /**
   * Returns true if a route should be muted.
   */
  isRouteMuted(route: string): boolean {
    return this.generalFunctionsService.inArray(this.routesMuted, route);
  }
}
