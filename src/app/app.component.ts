declare var window: any;

import { environment } from '../environments/environment';
import { Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { interval } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetAlertComponent } from './components/bottom-sheet-alert/bottom-sheet-alert.component';

import { routerTransition } from './router.transition';
import { UserService } from 'src/app/services/user/user.service';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackDialogComponent } from './components/feedback-dialog/feedback-dialog.component';

import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventEmitterService } from 'src/app/services/event-emitter.service';
import * as moment from 'moment';

enum FeedbackStage { Q1, Q2 };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routerTransition],
})
export class AppComponent {
  title = 'autonomy';

  public pageTransition: string = 'none';
  private previousPath: string = '';

  public feedbackStage: FeedbackStage = FeedbackStage.Q1;
  public latestFeedbackShowAt;
  private popupShown: boolean = false;

  private destroy;
  public timer: number;
  private rxjsTimer;

  constructor(
              public breakpointObserver: BreakpointObserver,
              private swUpdate: SwUpdate,
              private bottomSheet: MatBottomSheet,
              private router: Router,
              private userService: UserService,
              private dialog: MatDialog) {

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

    EventEmitterService.getEventEmitter(EventEmitterService.Events.FeedbackDialogShown).subscribe((data)=> {
      // open feedback form by user click will always start from question 1
      this.openFeedbackDialog(data.fromQ1);
    });

    this.checkHiddenApp();
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

  private checkHiddenApp() {
    if (typeof document.hidden === 'undefined') {
      console.log('Page Visibility API not supported.');
    }

    // get init visiable status for reload page
    if ('hidden' in document) {
      if (this.userService.getUser()) {
        let visiableTimes = this.userService.getPreference('app_visiable_times') || 0;
        let count = document['hidden'] ? visiableTimes : visiableTimes + 1;
        this.userService.setPreference('app_visiable_times', count);
      }
    }

    let handleVisibilityChange = () =>{
      if (this.userService.getUser() && !(document['hidden'])) {
        let visiableTimes = this.userService.getPreference('app_visiable_times') || 0;
        this.userService.setPreference('app_visiable_times', visiableTimes + 1);
        if (this.userService.getPreference('app_visiable_times') > 3 && !this.userService.getPreference('next_feedback_showTime') && !this.popupShown) {
          this.openFeedbackDialog();
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange, false);
  }

  private openFeedbackDialog(fromQ1: boolean = false) {
    if (this.userService.getUser()) {
      this.popupShown = true;
      let Q1 = this.userService.getPreference('Q1Replied');
      let Q2 = this.userService.getPreference('Q2Replied');

      this.feedbackStage = (!fromQ1) && (Q1 && !Q2) ? FeedbackStage.Q2 : FeedbackStage.Q1;

      // reset storage for a new feedback progress
      if (this.feedbackStage === FeedbackStage.Q1) {
        this.userService.setPreference('Q1Replied', false);
        this.userService.setPreference('Q2Replied', false);
      }

      const dialogRef = this.dialog.open(FeedbackDialogComponent, {
        autoFocus: true,
        data: { pageStage: this.feedbackStage }
      })

      dialogRef.afterClosed().subscribe(result => {
        let no1_answered = this.userService.getPreference('Q1Replied');
        let no2_answered = this.userService.getPreference('Q2Replied');

        // answered both questions and submited
        if (no1_answered && no2_answered) {
          this.userService.setPreference('next_feedback_showTime', moment().add(14, 'days').format());
          this.setEndtimeOnIntervalCheck();
        } else {
          // remind me later on question 2 or click out popup while feedback
          this.userService.setPreference('next_feedback_showTime', moment().add(1, 'days').format());
          this.setEndtimeOnIntervalCheck();
        }

        if (result && result.redirecToAccount) {
          this.router.navigate(['/home/setting']);
        }

        this.popupShown = false;
      })
    }
  }

  private setEndtimeOnIntervalCheck() {
    // complete the old interval
    if (this.destroy) {
      this.destroy.next();
      this.destroy.complete();
    }

    // set new interval check
    let end = moment(this.userService.getPreference('next_feedback_showTime'));
    this.intervalCheckFeedbackShown(end);
  }

  private intervalCheckFeedbackShown(endTime: moment.Moment) {
    this.destroy = new Subject();
    this.rxjsTimer = timer(60 * 1000, 60 * 60 * 1000);

    this.rxjsTimer.pipe(takeUntil(this.destroy)).subscribe(val => {
      this.timer = val;
      let current = moment();

      if (endTime.diff(current, 'hours') <= 0) {
        this.destroy.next();
        this.destroy.complete();
        if (!this.popupShown) {
          this.openFeedbackDialog();
        }
      }
    })
  }
}
