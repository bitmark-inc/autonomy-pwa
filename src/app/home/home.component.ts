import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HomepageState } from './homepage.state';
import { Subscription } from 'rxjs';

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  public isFullscreen: boolean = false;
  private stateSubscription: Subscription;
  
  constructor(public router: Router, private ref: ChangeDetectorRef) {}

  ngOnInit() {
     this.stateSubscription = HomepageState.fullscreen.subscribe(isFullscreen => {
      this.isFullscreen = isFullscreen;
      this.ref.detectChanges();
    });
  }

  ngOnDestroy() {
    HomepageState.fullscreen.next(false);
    this.stateSubscription.unsubscribe();
  }
}
