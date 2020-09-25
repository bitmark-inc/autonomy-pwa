declare var window: any;

import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HomepageState } from './homepage.state';
import { Subscription } from 'rxjs';

enum TabActivated { Survey, Resources, Account }

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ['./home.component.scss', './setting/setting.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public isFullscreen: boolean = false;
  private isTouchDevice: boolean = 'ontouchstart' in window;
  private stateSubscription: Subscription;

  public tabActivated: TabActivated = TabActivated.Resources;
  public currentTab: TabActivated = TabActivated.Resources;

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
    case '/home/resources':
      this.tabActivated = TabActivated.Resources;
      this.currentTab = this.tabActivated;
      break;
    case '/home/setting':
      this.tabActivated = TabActivated.Account;
      this.currentTab = this.tabActivated;
      break;
    case '/home/survey':
      this.tabActivated = TabActivated.Survey;
      this.currentTab = this.tabActivated;
      break;
    default:
      this.tabActivated = TabActivated.Resources;
      this.currentTab = this.tabActivated;
      break;
    }
  }

  public tabActiveChange(selectedIndex) {
    this.tabActivated = selectedIndex;
    switch (selectedIndex) {
    case 0:
      this.location.replaceState('/home/survey');
      break;
    case 1:
      this.location.replaceState('/home/resources');
      break;
    case 2:
      this.location.replaceState('/home/setting');
      break;
    default:
      this.location.replaceState("/home/resources");
      break;
    }
  }

  public tabClick() {
    if (!navigator.onLine) {
      if ((this.tabActivated === 1 && this.currentTab !== 1)) {
        window.alert('Please check your network connection, then try again.');
      }
      this.tabActivated = this.currentTab;
      return;
    } else {
      this.currentTab = this.tabActivated;
    }
  }
}
