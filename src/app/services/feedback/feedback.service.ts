import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackDialogComponent } from '../../components/feedback-dialog/feedback-dialog.component';

import { timer } from 'rxjs';
import * as moment from 'moment';

enum FeedbackStage { Q1, Q2 };
enum Question { Q1, Q2 };

const NEXT_FEEDBACK_SHOW_TIME: string = 'next_feedback_show_time';
const APP_VISIBLE_TIMES: string = 'app_visible_times';
const Q1_REPLIED: string = 'Q1_replied';
const Q2_REPLIED: string = 'Q2_replied';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  public static QUESTION = Question;

  public feedbackStage: FeedbackStage = FeedbackStage.Q1;
  private popupShown: boolean = false;

  public timer: number;
  private rxjsTimer;

  constructor(private router: Router, private userService: UserService, private dialog: MatDialog) { }

  private feedbackShown(): boolean {
    let show: boolean = false; // not show pop-up on default

    //have user data and popup isn't openning
    show = !!this.userService.getUser() && !this.popupShown;

    // already shown before then check for next show time
    if (show && this.userService.getPreference(NEXT_FEEDBACK_SHOW_TIME)) {
      let endTime = moment(this.userService.getPreference(NEXT_FEEDBACK_SHOW_TIME));
      let current = moment();
      show = endTime.diff(current, 'hours') < 0;
    }
    return show;
  }

  private intervalCheckFeedbackShown() {
    this.rxjsTimer = timer(60 * 1000, 5 * 60 * 1000);

    this.rxjsTimer.subscribe(val => {
      this.timer = val;

      if (this.feedbackShown()) {
        this.openFeedbackDialog();
      }
    })
  }

  private checkAppHidden() {
    if (typeof document.hidden === 'undefined') {
      console.log('Page Visibility API not supported.');
    }

    // get init visible status for reload page
    if ('hidden' in document) {
      if (this.userService.getUser()) {
        let visibleTimes = this.userService.getPreference(APP_VISIBLE_TIMES) || 0;
        let count = document['hidden'] ? visibleTimes : visibleTimes + 1;
        this.userService.setPreference(APP_VISIBLE_TIMES, count);
      }
    }

    let handleVisibilityChange = () => {
      if (this.userService.getUser() && !(document['hidden'])) {
        let visibleTimes = this.userService.getPreference(APP_VISIBLE_TIMES) || 0;
        this.userService.setPreference(APP_VISIBLE_TIMES, visibleTimes + 1);

        // experience app at least 3 times and haven't shown before
        if (this.userService.getPreference(APP_VISIBLE_TIMES) > 3 && !this.userService.getPreference(NEXT_FEEDBACK_SHOW_TIME) && !this.popupShown) {
          this.openFeedbackDialog()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange, false);
  }

  public initService() {
    this.checkAppHidden();
    this.intervalCheckFeedbackShown();
  }

  public openFeedbackDialog(fromQ1: boolean = false) {
    this.popupShown = true;
    let Q1 = this.userService.getPreference(Q1_REPLIED);
    let Q2 = this.userService.getPreference(Q2_REPLIED);

    this.feedbackStage = (!fromQ1) && (Q1 && !Q2) ? FeedbackStage.Q2 : FeedbackStage.Q1;

    // reset storage for a new feedback progress
    if (this.feedbackStage === FeedbackStage.Q1) {
      this.userService.setPreference(Q1_REPLIED, false);
      this.userService.setPreference(Q2_REPLIED, false);
    }

    const dialogRef = this.dialog.open(FeedbackDialogComponent, {
      autoFocus: true,
      data: { pageStage: this.feedbackStage }
    })

    dialogRef.afterClosed().subscribe(result => {
      let no1Answered = this.userService.getPreference(Q1_REPLIED);
      let no2Answered = this.userService.getPreference(Q2_REPLIED);

      // answered both questions and submited
      if (no1Answered && no2Answered) {
        this.userService.setPreference(NEXT_FEEDBACK_SHOW_TIME, moment().add(14, 'days').format());
      } else {
        // remind me later on question 2 or click out popup while feedback
        this.userService.setPreference(NEXT_FEEDBACK_SHOW_TIME, moment().add(1, 'days').format());
      }

      if (result && result.redirecToAccount) {
        this.router.navigate(['/home/setting']);
      }

      this.popupShown = false;
    })
  }
}
