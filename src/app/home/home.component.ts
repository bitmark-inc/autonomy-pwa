declare var window: any;

import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HomepageState } from './homepage.state';
import { Subscription } from 'rxjs';

enum TabActivated { Trends, Resources, Account }

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ['./home.component.scss', './setting/setting.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public isFullscreen: boolean = false;
  private isTouchDevice: boolean = 'ontouchstart' in window;
  private stateSubscription: Subscription;

  public tabActivated: TabActivated = TabActivated.Trends;

  constructor(public router: Router, private ref: ChangeDetectorRef, private location: Location) {
    this.setTabActivatedByUrl(this.router.url);
  }

  ngOnInit() {
    this.stateSubscription = HomepageState.fullscreen.subscribe(isFullscreen => {
      this.isFullscreen = this.isTouchDevice && isFullscreen;
      this.ref.detectChanges();
    });
  }

  ngOnDestroy() {
    this.stateSubscription.unsubscribe();
  }

  private setTabActivatedByUrl(url: string = '') {
    switch (url) {
    case '/home/trends':
      this.tabActivated = TabActivated.Trends;
      break;
    case '/home/resources':
      this.tabActivated = TabActivated.Resources;
      break;
    case '/home/setting':
      this.tabActivated = TabActivated.Account;
      break;
    default:
      this.tabActivated = TabActivated.Trends;
      break;
    }
  }

  public tabActiveChange(selectedIndex) {
    this.tabActivated = selectedIndex;
    switch (selectedIndex) {
    case 0:
      this.location.replaceState('/home/trends');
      break;
    case 1:
      this.location.replaceState('/home/resources');
      break;
    case 2:
      this.location.replaceState('/home/setting');
      break;
    default:
      this.location.replaceState('/home/trends');
      break;
    }
  }
}
