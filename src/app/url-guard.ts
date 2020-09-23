declare var window: any;

import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from './services/user/user.service';

@Injectable()
class PWAUserGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.userService.getUser() ? true : this.router.createUrlTree(['onboarding'], {queryParams: route.queryParams});
  }
}

@Injectable()
class PWAGuestGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.userService.getUser() ? this.router.createUrlTree(['home', 'resources'], {queryParams: route.queryParams}) : true;
  }
}

@Injectable()
class PWAGuard implements CanActivate {

  private isPWA: boolean;

  constructor(private router: Router) {
    this.isPWA = window.matchMedia('(display-mode: standalone)').matches;
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.isPWA ? true : this.router.createUrlTree(['installation'], {queryParams: route.queryParams});
  }
}

@Injectable()
class BrowserGuard implements CanActivate {

  private isBrowser: boolean;

  constructor(private router: Router) {
    this.isBrowser = !window.matchMedia('(display-mode: standalone)').matches;
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.isBrowser ? true : this.router.createUrlTree(['onboarding'], {queryParams: route.queryParams});
  }
}

@Injectable()
class NetworkGuard implements CanActivate {

  constructor() { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (navigator.onLine) {
      return true;
    }
    window.alert('Please check your network connection, then try again.');
    return false;
  }
}

export { PWAUserGuard, PWAGuestGuard, PWAGuard, BrowserGuard, NetworkGuard };
