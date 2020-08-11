declare var window: any;

import { Injectable } from '@angular/core';
import { Route, Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserService } from './services/user/user.service';

@Injectable()
class AuthGuard implements CanActivate {
  private isPWA: boolean;

  constructor(private router: Router, private userService: UserService) {
    this.isPWA = window.matchMedia('(display-mode: standalone)').matches;
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.isPWA) {
      if (this.userService.getUser()) {
        return true;
      }
    }
    this.router.navigate(['/landing/b']);
  }
}

@Injectable()
class GuestGuard implements CanActivate {
  private isPWA: boolean;

  constructor(private router: Router, private userService: UserService) {
    this.isPWA = !!(window.matchMedia('(display-mode: standalone)').matches);
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.isPWA) {
      if (route.routeConfig.path !== 'landing/b') {
        this.router.navigate(['/landing/b']);
      }
      return true;
    }
    if (this.isPWA && !this.userService.getUser()) {
      if (route.routeConfig.path === '' || route.routeConfig.path === 'landing/b') {
        this.router.navigate(['/landing/p']);
      }
      return true;
    }
    this.router.navigate(['/home/trends']);
  }
}

export { AuthGuard, GuestGuard }
