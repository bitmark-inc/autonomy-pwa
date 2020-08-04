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
    this.router.navigate(['/landing']);
  }
}

@Injectable()
class GuestGuard implements CanActivate {

  constructor(private router: Router, private userService: UserService) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      if (route.routeConfig.path !== 'landing') {
        this.router.navigate(['/landing']);
      }
      return true;
    } else if (window.matchMedia('(display-mode: standalone)').matches && !this.userService.getUser()) {
      return true;
    }
    this.router.navigate(['/home']);
  }
}

export { AuthGuard, GuestGuard }
