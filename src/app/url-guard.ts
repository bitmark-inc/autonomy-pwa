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
    this.router.navigate(['/installation']);
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
      if (route.routeConfig.path !== 'installation') {
        let pid = route.queryParams['pid'] || this.userService.getParticipantID();
        this.router.navigate(['/installation'], {queryParams: {'pid': pid}});
      }
      return true;
    }
    if (this.isPWA && !this.userService.getUser()) {
      if (route.routeConfig.path === '' || route.routeConfig.path === 'installation') {
        let pid = route.queryParams['pid'] || this.userService.getParticipantID();
        this.router.navigate(['/onboarding'], {queryParams: {'pid': pid}});
      }
      return true;
    }
    this.router.navigate(['/home/trends']);
  }
}

@Injectable()
class ParticipantGuard implements CanActivate {

  constructor(private router: Router, private userService: UserService) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (route.queryParams['pid'] || this.userService.getParticipantID()) {
      return true;
    }
    this.router.navigate(['/404']);
  }
}

@Injectable()
class NetworkGuard implements CanActivate {

  constructor(private router: Router, private userService: UserService) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (navigator.onLine) {
      return true;
    }
    window.alert('Please check your network connection, then try again.');
    return false;
  }
}

export { AuthGuard, GuestGuard, ParticipantGuard, NetworkGuard }
