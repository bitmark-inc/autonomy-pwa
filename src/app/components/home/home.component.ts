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
  public currentTab: TabActivated = TabActivated.Trends;

  constructor(public router: Router, private ref: ChangeDetectorRef, private location: Location) {
    this.setTabActivatedByUrl(this.router.url.split('?')[0]);
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
      this.currentTab = this.tabActivated;
      break;
    case '/home/resources':
      this.tabActivated = TabActivated.Resources;
      this.currentTab = this.tabActivated;
      break;
    case '/home/setting':
      this.tabActivated = TabActivated.Account;
      this.currentTab = this.tabActivated;
      break;
    default:
      this.tabActivated = TabActivated.Trends;
      this.currentTab = this.tabActivated;
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

  public tabClick() {
    if (!navigator.onLine) {
      if ((this.tabActivated === 0 && this.currentTab !== 0) || (this.tabActivated === 2 && this.currentTab !== 2)) {
        window.alert('Please check your network connection, then try again.');
      }
      this.tabActivated = this.currentTab;
      return;
    } else {
      this.currentTab = this.tabActivated;
    }
  }
}
