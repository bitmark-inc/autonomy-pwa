declare var window: any;

import { environment } from '../environments/environment';
import { Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { interval } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from './components/bottom-sheet-alert/bottom-sheet-alert.component';

import { routerTransition } from "./router.transition";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routerTransition],
})
export class AppComponent {
  title = 'autonomy';

  public pageTransition: string = 'none';
  private previousPath: string = ''

  constructor(
              public breakpointObserver: BreakpointObserver,
              private swUpdate: SwUpdate,
              private bottomSheet: MatBottomSheet,
              private router: Router) {

    if (environment.production) {
      this.autoupdateApp();
      window.OneSignal = window.OneSignal || [];
      window.OneSignal.push(() => {
        window.OneSignal.init({
          appId: environment.onesignal_app_id,
          notifyButton: { enable: false },
        });
      });
    }

    this.router.events.subscribe(event => {
      if(event instanceof NavigationStart) {
        this.setPageTransition(event.url);
      }
    });
  }

  private autoupdateApp() {
    this.swUpdate.checkForUpdate();

    interval(1000 * 60 * 2).subscribe(() => {
      this.swUpdate.checkForUpdate();
    });

    this.swUpdate.available.subscribe(
      () => {
        console.log('Checking for update...');
        this.swUpdate.activateUpdate().then(() => {
          console.log('Update downloaded!');
          this.openBottomSheet();
        });
      }
    );
  }

  private openBottomSheet(): void {
    this.bottomSheet.open(BottomSheetAlertComponent, {
      disableClose: true,
      data: {
        error: false,
        header: 'updated',
        mainContent: 'We’ve updated Autonomy to improve performance and stability.',
        leftBtn: 'reload',
        leftBtnAction: () => { location.reload(); },
      }
    });
  }

  private setPageTransition(path: string) {
    let transitionName = 'section'
    let isSame = this.previousPath === path
    let isBackward = this.previousPath.startsWith(path)
    let isForward = path.startsWith(this.previousPath)

    if (isSame) {
      transitionName = 'none'
    } else if (isBackward && isForward) {
      transitionName = 'initial'
    } else if (isBackward) {
      transitionName = 'backward'
    } else if (isForward) {
      transitionName = 'forward'
    }

    this.previousPath = path;
    this.pageTransition = transitionName;
  }
}
