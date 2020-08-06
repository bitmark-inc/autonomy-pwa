declare var window: any;

import { Injectable } from '@angular/core';
import { Route, Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserService } from './services/user/user.service';

@Injectable()
class AuthGuard implements CanActivate {

  constructor(private router: Router, private userService: UserService) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      if (this.userService.getUser()) {
        return true;
      }
    }
    this.router.navigate(['/landing/b']);
  }
}

@Injectable()
class GuestGuard implements CanActivate {

  constructor(private router: Router, private userService: UserService) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      if (route.routeConfig.path !== 'landing/b') {
        this.router.navigate(['/landing/b']);
      }
      return true;
    }
    if (window.matchMedia('(display-mode: standalone)').matches && !this.userService.getUser()) {
      if (route.routeConfig.path === 'landing/b') {
        this.router.navigate(['/landing/p']);
      }
      return true;
    }
    this.router.navigate(['/home']);
  }
}

export { AuthGuard, GuestGuard }
